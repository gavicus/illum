namespace View {
	export enum State {table, detail, choice, chooseLink, attackSetup};
	export enum AttackState {setup, success, failure};

	export class CardShape {
		static arrowSize = 0.1;
		static cornerSize = 0.15;
		static draw(card: Model.Card){
			// orient called before draw
			CardShape.drawBorder(card);
		}
		static drawBorder(card: Model.Card){
			this.drawRoundRect(card.shape.rect, View.getArcSize());
		}
		static drawRoundRect(rect: Util.Rectangle, cornerSize){
			let deltax = new Util.Point(cornerSize, 0);
			let deltay = new Util.Point(0, cornerSize);
			let corner = rect.upperLeft.clone();
			View.beginPath();
			View.moveTo(rect.upperLeft.plus(deltax));
			corner.x = rect.lowerRight.x;
			View.lineTo(corner.minus(deltax));
			View.arcTo(corner, corner.plus(deltay));
			View.lineTo(rect.lowerRight.minus(deltay));
			View.arcTo(rect.lowerRight, rect.lowerRight.minus(deltax));
			corner.copy(rect.upperLeft);
			corner.y = rect.lowerRight.y;
			View.lineTo(corner.plus(deltax));
			View.arcTo(corner, corner.minus(deltay));
			View.lineTo(rect.upperLeft.plus(deltay));
			View.arcTo(rect.upperLeft, rect.upperLeft.plus(deltax));
		}
		static drawLink(apex: Util.Point, center: Util.Point, inward: boolean){
			let left = apex.clone();
			let right = apex.clone();
			let arrowSize = View.cardLength * CardShape.arrowSize;
			let toCenter = center.minus(apex).normal.times(arrowSize);
			let toSide = toCenter.switched.dividedBy(2);
			left.add(toSide);
			right.add(toSide.negative);
			if(inward){ apex.add(toCenter); }
			else {
				left.add(toCenter);
				right.add(toCenter);
			}
			View.beginPath();
			View.moveTo(apex);
			View.lineTo(left);
			View.lineTo(right);
			View.lineTo(apex);
		}
		static orient(card: Model.Card, stem: Util.Point, direction: number){
			// stem point already shifted by focus
			// cardLength already determined from view
			card.shape.stem.copy(stem);
			card.shape.links[0].copy(stem);
			card.shape.links[1].copy(stem);
			card.shape.links[2].copy(stem);
			card.shape.links[3].copy(stem);
			card.shape.rotation = direction;
			let cardWidth = View.cardLength * View.widthRatio;
			let x,y,w,h;
			if(direction === 0){ // right
				w = View.cardLength; h = cardWidth;
				x = stem.x; y = stem.y - h/2;
				card.shape.links[1].move(w/2, -h/2);
				card.shape.links[2].movex(w);
				card.shape.links[3].move(w/2, h/2);
			}
			else if(direction === 1){ // down
				w = cardWidth; h = View.cardLength;
				x = stem.x - w/2; y = stem.y;
				card.shape.links[1].move(w/2, h/2);
				card.shape.links[2].movey(h);
				card.shape.links[3].move(-w/2, h/2);
			}
			else if(direction === 2){ // left
				w = View.cardLength; h = cardWidth;
				x = stem.x - w; y = stem.y - h/2;
				card.shape.links[1].move(-w/2, h/2);
				card.shape.links[2].movex(-w);
				card.shape.links[3].move(-w/2, -h/2);
			}
			else if(direction === 3){ // up
				w = cardWidth; h = View.cardLength;
				x = stem.x - w/2; y = stem.y - h;
				card.shape.links[1].move(-w/2, -h/2);
				card.shape.links[2].movey(-h);
				card.shape.links[3].move(w/2, -h/2);
			}
			card.shape.rect.set(x,y,w,h);
		}
	}

	export class Button {
		public static size: Util.Point;
		public rect: Util.Rectangle;
		public font = View.boldFont;
		public outline = true;
		public selected = false;
		public visible = true;
		public textAlign = 'center';
		public data: any;
		public textPoint: Util.Point;

		static colors = {
			fill: '#efefef',
			border: '#ccc',
			text: 'gray',
			hoveredFill: 'gray',
			hoveredText: 'orange',
			selectedFill: '#ccf',
		};

		static getHoveredButton (buttonSet: Button[], mouse: Util.Point): Button {
			for (let btn of buttonSet) {
				if(btn.hovered(mouse)) { return btn; }
			}
			return null;
		}

		constructor (public caption: string, public callback: (button: View.Button) => void, private ulCorner) {
			Button.size = new Util.Point(80,18);
			this.rect = new Util.Rectangle(ulCorner.x, ulCorner.y, Button.size.x, Button.size.y);
			this.textPoint = this.rect.center;
		}
		draw (c: CanvasRenderingContext2D, hovered: boolean) {
			if (!this.visible) { return; }
			if (this.outline) {
				CardShape.drawRoundRect(this.rect, 10);

				if (hovered) { View.context.fillStyle = Button.colors.hoveredFill; }
				else if(this.selected) { View.context.fillStyle = Button.colors.selectedFill; }
				else { View.context.fillStyle = Button.colors.fill; }

				View.context.fill();
				View.context.strokeStyle = Button.colors.border;
				View.context.stroke();
			}
			View.context.font = this.font;
			View.context.fillStyle = hovered ? Button.colors.hoveredText : Button.colors.text;
			View.context.textAlign = this.textAlign;
			View.context.textBaseline = 'middle';
			View.context.fillText(this.caption, this.textPoint.x, this.textPoint.y);
		}
		hovered (mouse: Util.Point): boolean {
			return this.rect.contains(mouse);
		}
		moveTo (point: Util.Point) {
			let dims = this.rect.lowerRight.minus(this.rect.upperLeft);
			this.rect.upperLeft.copy(point);
			this.rect.lowerRight.copy(point.plus(dims));
		}
	}

}