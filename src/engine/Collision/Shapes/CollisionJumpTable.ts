﻿import { Circle } from './Circle';
import { CollisionContact } from '../Detection/CollisionContact';
import { ConvexPolygon } from './ConvexPolygon';
import { Edge } from './Edge';

export const CollisionJumpTable = {
  CollideCircleCircle(circleA: Circle, circleB: Circle): CollisionContact {
    const radius = circleA.radius + circleB.radius;
    const circleAPos = circleA.worldPos;
    const circleBPos = circleB.worldPos;
    if (circleAPos.distance(circleBPos) > radius) {
      return null;
    }

    const axisOfCollision = circleBPos.sub(circleAPos).normalize();
    const mvt = axisOfCollision.scale(radius - circleBPos.distance(circleAPos));

    const pointOfCollision = circleA.getFurthestPoint(axisOfCollision);

    return new CollisionContact(circleA.collider, circleB.collider, mvt, [pointOfCollision], axisOfCollision);
  },

  CollideCirclePolygon(circle: Circle, polygon: ConvexPolygon): CollisionContact {
    let minAxis = circle.testSeparatingAxisTheorem(polygon);
    if (!minAxis) {
      return null;
    }

    // make sure that the minAxis is pointing away from circle
    const samedir = minAxis.dot(polygon.center.sub(circle.center));
    minAxis = samedir < 0 ? minAxis.negate() : minAxis;

    const point = circle.getFurthestPoint(minAxis);

    return new CollisionContact(
      circle.collider,
      polygon.collider,
      minAxis,
      [point],
      minAxis.normalize()
    );
  },

  CollideCircleEdge(circle: Circle, edge: Edge): CollisionContact {
    // center of the circle
    const cc = circle.center;
    // vector in the direction of the edge
    const e = edge.end.sub(edge.begin);

    // amount of overlap with the circle's center along the edge direction
    const u = e.dot(edge.end.sub(cc));
    const v = e.dot(cc.sub(edge.begin));

    // Potential region A collision (circle is on the left side of the edge, before the beginning)
    if (v <= 0) {
      const da = edge.begin.sub(cc);
      const dda = da.dot(da); // quick and dirty way of calc'n distance in r^2 terms saves some sqrts
      // save some sqrts
      if (dda > circle.radius * circle.radius) {
        return null; // no collision
      }
      return new CollisionContact(
        circle.collider,
        edge.collider,
        da.normalize().scale(circle.radius - Math.sqrt(dda)),
        [edge.begin],
        da.normalize()
      );
    }

    // Potential region B collision (circle is on the right side of the edge, after the end)
    if (u <= 0) {
      const db = edge.end.sub(cc);
      const ddb = db.dot(db);
      if (ddb > circle.radius * circle.radius) {
        return null;
      }
      return new CollisionContact(
        circle.collider,
        edge.collider,
        db.normalize().scale(circle.radius - Math.sqrt(ddb)),
        [edge.end],
        db.normalize()
      );
    }

    // Otherwise potential region AB collision (circle is in the middle of the edge between the beginning and end)
    const den = e.dot(e);
    const pointOnEdge = edge.begin
      .scale(u)
      .add(edge.end.scale(v))
      .scale(1 / den);
    const d = cc.sub(pointOnEdge);

    const dd = d.dot(d);
    if (dd > circle.radius * circle.radius) {
      return null; // no collision
    }

    let n = e.perpendicular();
    // flip correct direction
    if (n.dot(cc.sub(edge.begin)) < 0) {
      n.x = -n.x;
      n.y = -n.y;
    }

    n = n.normalize();

    const mvt = n.scale(Math.abs(circle.radius - Math.sqrt(dd)));
    return new CollisionContact(circle.collider, edge.collider, mvt.negate(), [pointOnEdge], n.negate());
  },

  CollideEdgeEdge(): CollisionContact {
    // Edge-edge collision doesn't make sense
    return null;
  },

  CollidePolygonEdge(polygon: ConvexPolygon, edge: Edge): CollisionContact {

    const pc = polygon.center;
    const ec = edge.center;
    const dir = ec.sub(pc).normalize();

    // build a temporary polygon from the edge to use SAT
    const linePoly = new ConvexPolygon({
      collider: edge.collider,
      points: [edge.begin, edge.end, edge.end.add(dir.scale(100)), edge.begin.add(dir.scale(100))]
    });
    linePoly.update(edge.collider.owner.transform);
    return this.CollidePolygonPolygon(polygon, linePoly);
  },

  CollidePolygonPolygon(polyA: ConvexPolygon, polyB: ConvexPolygon): CollisionContact {
    // Multi contact from SAT
    // https://gamedev.stackexchange.com/questions/111390/multiple-contacts-for-sat-collision-detection
    // do a SAT test to find a min axis if it exists
    let overlapInfo = polyA.testSeparatingAxisTheorem(polyB);

    // no overlap, no collision return null
    if (!overlapInfo) {
      return null;
    }

    let minAxis = overlapInfo.normal.normalize().scale(overlapInfo.overlap);

    // TODO is this necessary?
    // make sure that minAxis is pointing from A -> B
    const sameDir = minAxis.dot(polyB.center.sub(polyA.center));
    minAxis = sameDir < 0 ? minAxis.negate() : minAxis;

    // The incident side is the most opposite from the axes of collision on the other shape
    const other = overlapInfo.ref === polyA ? polyB : polyA;
    const incident = other.queryForOppositeSide(minAxis)

    // Clip incident side by the perpendicular lines at each end of the reference side
    // https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm
    const sideDirection = overlapInfo.side.dir().normalize();
    const clipRight = incident.clip(sideDirection.negate(), -sideDirection.dot(overlapInfo.side.begin));
    const clipLeft = clipRight?.clip(sideDirection, sideDirection.dot(overlapInfo.side.end));
    if (clipLeft) {
      // We only want clip points below the reference edge, discard the others
      // const referencePosition = overlapInfo.side.normal().dot(overlapInfo.side.end);
      const points = clipLeft.getPoints().filter(p => {
        return overlapInfo.side.below(p)
      });
      
      return new CollisionContact(polyA.collider, polyB.collider, minAxis, points, minAxis.normalize());
    }
    return null;
  }
};
