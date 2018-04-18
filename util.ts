namespace Util {
	
	export function randomInt(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	export class Point {
		constructor(public x: number = 0, public y: number = 0){}
		add(p: Point){
			this.move(p.x, p.y);
		}
		clone(): Point { return new Point(this.x, this.y); }
		copy(p: Point): void {
			this.x = p.x;
			this.y = p.y;
		}
		distSquared(p: Point): number {
			return Math.pow(this.x-p.x,2) + Math.pow(this.y-p.y,2);
		}
		dividedBy(n: number): Point {
			return new Point(this.x/n, this.y/n);
		}
		times(m: number): Point {
			return new Point(this.x*m, this.y*m);
		}
		equals(p: Point){
			return this.x === p.x && this.y === p.y;
		}
		floor(): Point {
			return new Point(Math.floor(this.x), Math.floor(this.y));
		}
		minus(p: Point): Point{
			return new Point(this.x - p.x, this.y - p.y);
		}
		move(dx:number, dy:number): void {
			this.movex(dx);
			this.movey(dy);
		}
		movex(d: number): void { this.x += d; }
		movey(d: number): void { this.y += d; }
		get negative(): Point {
			return new Point ( -this.x, -this.y );
		}
		get normal(): Point {
			return new Point(
				(this.x === 0) ? 0 : this.x / Math.abs(this.x),
				(this.y === 0) ? 0 : this.y / Math.abs(this.y)
			);
		}
		get switched(): Point {
			return new Point (this.y, this.x);
		}
		plus(p: Point): Point{
			return new Point(this.x + p.x, this.y + p.y);
		}
		set(x:number, y:number){
			this.x = x;
			this.y = y;
		}
		toString(): string {
			return '(' + this.x + ', ' + this.y + ')';
		}
	}

	export class Rectangle {
		upperLeft: Point;
		lowerRight: Point;
		constructor(x,y,w,h){
			this.set(x,y,w,h);
		}
		set(x,y,w,h){
			this.upperLeft = new Point(x,y);
			this.lowerRight = new Point(x+w, y+h);
		}
		contains(p: Point): boolean {
			if(p.x < this.upperLeft.x){ return false; }
			if(p.y < this.upperLeft.y){ return false; }
			if(p.x > this.lowerRight.x){ return false; }
			if(p.y > this.lowerRight.y){ return false; }
			return true;
		}
		get center(): Point {
			return new Point(
				this.upperLeft.x + (this.lowerRight.x - this.upperLeft.x) / 2,
				this.upperLeft.y + (this.lowerRight.y - this.upperLeft.y) / 2
			);
		}
	}
}