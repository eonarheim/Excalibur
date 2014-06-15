/// <reference path="Algebra.ts"/>
/// <reference path="Events.ts"/>

module ex.Util {
   
   

   export function base64Encode(inputStr: string) {
      var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var outputStr = "";
      var i = 0;

      while (i < inputStr.length) {
         //all three "& 0xff" added below are there to fix a known bug 
         //with bytes returned by xhr.responseText
         var byte1 = inputStr.charCodeAt(i++) & 0xff;
         var byte2 = inputStr.charCodeAt(i++) & 0xff;
         var byte3 = inputStr.charCodeAt(i++) & 0xff;

         var enc1 = byte1 >> 2;
         var enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);

         var enc3, enc4;
         if (isNaN(byte2)) {
            enc3 = enc4 = 64;
         }
         else {
            enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
            if (isNaN(byte3)) {
               enc4 = 64;
            }
            else {
               enc4 = byte3 & 63;
            }
         }

         outputStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
      }

      return outputStr;
   }

   export function clamp(val, min, max) {
      return val <= min ? min : (val >= max ? max : val);
   }

   export function drawLine(ctx: CanvasRenderingContext2D, color: string, startx, starty, endx, endy) {
      ctx.beginPath();
      ctx.strokeStyle = color
      ctx.moveTo(startx, starty);
      ctx.lineTo(endx, endy);
      ctx.closePath();
      ctx.stroke();  
   }

   export function randomInRange(min: number, max: number) : number {
      return min + Math.random() * (max - min);
   }

   export function getPosition(el: HTMLElement): Point {
      var oLeft: number = 0,
         oTop: number = 0;

      var calcOffsetLeft = (parent: HTMLElement) => {
         oLeft += parent.offsetLeft; 

         if (parent.offsetParent) {
            calcOffsetLeft(parent.offsetParent);
         }                 
      };
      var calcOffsetTop = (parent: HTMLElement) => {
         oTop += parent.offsetTop;  
         if (parent.offsetParent) {
            calcOffsetTop(parent.offsetParent);
         }                
      };

      calcOffsetLeft(el);
      calcOffsetTop(el);

      return new Point(oLeft, oTop);
   }

   export function getOppositeSide(side: ex.Side){
      if(side === ex.Side.Top) return ex.Side.Bottom;
      if(side === ex.Side.Bottom) return ex.Side.Top;
      if(side === ex.Side.Left) return ex.Side.Right;
      if(side === ex.Side.Right) return ex.Side.Left

      return ex.Side.None
   }

   /**
    * Excaliburs dynamically resizing collection
    * @class Collection
    * @constructor
    * @param [initialSize=200] {number} Initial size of the internal backing array
    */
   export class Collection<T> {
      /**
       * Default collection size
       * @property DefaultSize {number}
       * @static
       * @final
       */
      public static DefaultSize = 200;
      private _internalArray: T[] = null;
      private _endPointer: number = 0;


      constructor(initialSize?: number) {
         var size = initialSize || Collection.DefaultSize;
         this._internalArray = new Array<T>(size);
      } 

      private _resize() {
         var newSize = this._internalArray.length * 2;
         var newArray = new Array<T>(newSize);
         var count = this.count();
         for (var i = 0; i < count; i++) {
            newArray[i] = this._internalArray[i];
         }

         delete this._internalArray;
         this._internalArray = newArray;
      }

      /**
       * Push elements to the end of the collection
       * @method push
       * @param element {T}
       * @returns T
       */
      public push(element: T): T {
         if (this._endPointer === this._internalArray.length) {
            this._resize();
         }
         return this._internalArray[this._endPointer++] = element;
      }

      /**
       * Removes elements from the end of the collection
       * @method pop
       * @returns T
       */
      public pop(): T {
         this._endPointer = this._endPointer - 1 < 0 ? 0 : this._endPointer - 1;
         return this._internalArray[this._endPointer];
      }

      /**
       * Returns the count of the collection
       * @method count
       * @returns number
       */
      public count(): number {
         return this._endPointer;
      }

      /**
       * Empties the collection
       * @method clear
       */
      public clear() {
         this._endPointer = 0;
      }

      /**
       * Returns the size of the internal backing array
       * @method internalSize
       * @returns number
       */
      public internalSize(): number {
         return this._internalArray.length;   
      }

      /**
       * Returns an element at a specific index
       * @method elementAt
       * @param index {number} Index of element to retreive
       * @returns T
       */
      public elementAt(index: number): T {
         if (index >= this.count()) {
            return;
         }
         return this._internalArray[index];
      }

      /**
       * Inserts an element at a specific index
       * @method insert
       * @param index {number} Index to insert the element
       * @returns T
       */
      public insert(index: number, value: T): T {
         if (index >= this.count()) {
            this._resize();
         }
         return this._internalArray[index] = value;
      }

      /**
       * Removes an element at a specific index
       * @method remove
       * @param index {number} Index of element to remove
       * @returns T
       */
      public remove(index: number): T {
         var count = this.count();
         if (count === 0) return;
         // O(n) Shift 
         var removed = this._internalArray[index];
         for (var i = index; i < count; i++) {
            this._internalArray[i] = this._internalArray[i + 1];
         }
         this._endPointer--;
         return removed;
      }

      /**
       * Removes an element by reference
       * @method removeElement
       * @param element {T} Index of element to retreive
       */
      public removeElement(element: T) {
         var index = this._internalArray.indexOf(element);
         this.remove(index);
      }

      /**
       * Returns a array representing the collection
       * @method toArray
       * @returns T[]
       */
      public toArray(): T[] {
         return this._internalArray.slice(0, this._endPointer);
      }

      /**
       * Iterate over every element in the collection
       * @method forEach
       * @param func {(T,number)=>any} Callback to call for each element passing a reference to the element and its index, returned values are ignored
       */
      public forEach(func: (element: T, index: number) => any) {
         var count = this.count();
         for (var i = 0; i < count; i++) {
            func.call(this, this._internalArray[i], i);
         }
      }

      /**
       * Mutate every element in the collection
       * @method map
       * @param func {(T,number)=>any} Callback to call for each element passing a reference to the element and its index, any values returned mutate the collection
       */
      public map(func: (element: T, index: number) => any) {
         var count = this.count();
         for (var i = 0; i < count; i++) {
            this._internalArray[i] = func.call(this, this._internalArray[i], i);
         }
      }
   }
}