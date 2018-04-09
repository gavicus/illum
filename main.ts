
namespace Util {
	export class Point {
		x: number;
		y: number;
		constructor(px=0, py=0){
			this.x = px;
			this.y = py;
		}
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

namespace Model {
	export class Model {
		static shownCards: Card[] = [];

		static getHoveredCard(mouse: Util.Point): Card {
			for (let card of this.shownCards) {
				if(card.shape.rect.contains(mouse)) { return card; }
			}
			return null;
		}
		static newCard(faction: Faction, name: string, links: number){
			let card = new Card(name, links);
			card.faction = faction;
			this.shownCards.push(card);
			return card;
		}
		static getLinkTargets(movingCard: Card): LinkTarget[] {
			let faction = movingCard.faction;
			let targets = [];
			for (let card of this.shownCards) {
				if (card.faction !== faction) { continue; }
				if (card === movingCard){ continue; }
				if (card.isDescendantOf(movingCard)) { continue; }
				for (let index = 0; index < card.links.length; ++index){
					if (card.links[index] !== 1) { continue; }
					targets.push(new LinkTarget(card.shape.links[index], card, index));
				}
			}
			return targets;
		}
	}

	export class LinkTarget {
		constructor(public point: Util.Point, public card: Card, public linkIndex: number){}
	}

	export class Faction {
		root: Card;
		constructor(){
			this.root = Model.newCard(this, 'root', 4);
			let child = Model.newCard(this, 'child', 3);
			this.root.addCard(child, 2);
			let grand = Model.newCard(this, 'grand1', 1);
			child.addCard(grand,2);
			let grand2 = Model.newCard(this, 'grand2', 2);
			child.addCard(grand2,3);
		}
	}

	export class Card {
		name: string;
		faction: Faction;
		linkCount: number;
		parent: Card;
		links: any[];
		shape: any;
		constructor(name: string, links: number) {
			this.name = name;
			this.linkCount = links;
			this.parent = null;
			this.shape = { // screen points for drawing and interaction
				rotation: 0, // 0 = horizontal, stem on left side
				stem: new Util.Point(0,0), // connection to parent
				rect: new Util.Rectangle(0,0,0,0),
				links: [
					new Util.Point(0,0), new Util.Point(0,0),
					new Util.Point(0,0), new Util.Point(0,0),
				],
				rootPoint: null,
			};
			this.links = [0,0,0,0];
			if(links===4){ this.links[0] = 1; }
			if(links > 1){ this.links[1] = 1; }
			if(links !== 2 && links !== 0){ this.links[2] = 1; }
			if(links > 1){ this.links[3] = 1; }
		}
		get children(): Card[] {
			let children = [];
			for (let link of this.links) {
				if (typeof link !== 'number') {
					children.push(link);
				}
			}
			return children;
		}
		addCard(card: Card, link: number): boolean {
			if(this.links[link]!==1){ return false; }
			this.links[link] = card;
			card.parent = this;
			return true;
		}
		decouple() {
			for (let dir in Object.keys(this.parent.links)) {
				if(typeof this.parent.links[dir] !== 'number' && this.parent.links[dir] === this){
					this.parent.links[dir] = 1;
					this.parent = null;
					return;
				}
			}
			throw new Error('error decoupling child node');
		}
		getChildDirection(child: Card): string {
			for (let dir in Object.keys(this.links)){
				if(typeof this.links[dir] !== 'number' && this.links[dir] === child){
					return dir;
				}
			}
			return null;
		}
		isDescendantOf(card: Card): boolean {
			let cursor = this.parent;
			while (cursor) {
				if(cursor === card) { return true; }
				cursor = cursor.parent;
			}
			return false;
		}
	}

	export class Deck {
		static roots: Card[];
		static plots: Card[];
		static library = {
			roots: [
				'1|Bavarian Illuminati|10|10|9|May make one privileged attack each turn at a cost of 5MB',
				'2|Bermuda Triangle|8|8|9|You may reorganize your groups freely at the end of your turn',
				'3|Discordian Society|7|7|9|You have a +4 on any attempt to control Weird groups. Your power structure is immune to attacks or special abilities from Government or Straight groups.',
				'4|Gnomes of Zurich|7|7|12|May move money freely at end of turn',
				'5|Network|8|8|9|You start your turn by drawing two cards in stead of one',
				'6|Servants of Cthulhu|9|9|9|You have a +4 on any attempt to destroy, even with Disasters and Assassinations. Draw a card whenever you destroy a group.',
			],
			plots: [],
		};

		static init () {
			for (let root of Deck.library.roots) {}
		}
	}
}

namespace View {
	class CardShape {
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

	class Button {
		readonly size = new Util.Point(80, 18);
		public rect: Util.Rectangle;
		constructor (public caption: string, private ulCorner) {
			this.rect = new Util.Rectangle(ulCorner.x, ulCorner.y, this.size.x, this.size.y);
		}
		hovered (mouse: Util.Point): boolean {
			return this.rect.contains(mouse);
		}
	}

	export class View {
		static canvas: HTMLCanvasElement;
		static context: CanvasRenderingContext2D;
		static readonly arcRadius = 0.15;
		static readonly widthRatio = 0.7;
		static cardLength = 50; // changes with zoom
		static detailButtons: Button[];
		static hoveredButton: Button = null;
		static focus: Util.Point;
		static colors: any;

		constructor(){
			View.canvas = <HTMLCanvasElement>document.getElementById('canvas');
			View.context = View.canvas.getContext('2d');
			View.focus = new Util.Point(View.canvas.width/2, View.canvas.height/2);
			View.colors = {
				button: {
					fill: '#efefef',
					border: '#ccc',
					text: 'gray',
					hoveredFill: 'gray',
					hoveredText: 'white',
				},
				card: {
					border: '#bbb',
					link: '#bbb',
					fill: '#f0f0f0',
					text: 'gray',
					hoveredBorder: '#f80',
				},
				rootCard: {
					fill: '#bbb',
					link: '#f0f0f0',
				},
				screen: {
					fill: '#f8f8f8',
				},
			};
			View.detailButtons = [
				new Button('move', new Util.Point(20, 100)),
			];
		}
		dragFocus(delta: Util.Point) {
			View.focus.move(delta.x, delta.y);
		}
		draw(factions: Model.Faction[], hoveredCard: Model.Card){
			this.clear();
			for (let faction of factions) {
				// pre-orient each root card and make it immobile
				CardShape.orient(faction.root, faction.root.shape.rootPoint.plus(View.focus), 0);
				this.drawCard(faction.root);
			}
			if(hoveredCard){
				CardShape.drawBorder(hoveredCard);
				View.context.strokeStyle = View.colors.card.hoveredBorder;
				View.context.stroke();
			}
		}
		drawLinkChoice(factions: Model.Faction[], hoveredCard: Model.Card, closest){
			this.draw(factions, hoveredCard);
			if (!closest) { return; }
			View.beginPath();
			View.context.arc(closest.point.x, closest.point.y, View.getArcSize(), 0, 2*Math.PI, false);
			View.context.strokeStyle = 'red';
			View.context.stroke();
		}
		drawDetail(card: Model.Card, mouse: Util.Point = null){

			console.log('View.drawDetail', card, mouse);

			this.clear();
			let gutter = 20;
			let lineHeight = 16;
			let textSize = 10;
			let cursor = new Util.Point(gutter, gutter);
			
			let bodyText = textSize + "px sans-serif";
			let boldText = "bold " + textSize + "px sans-serif";
			View.context.font = boldText;
			View.context.fillStyle = View.colors.card.text;
			View.context.textAlign = 'left';
			View.context.textBaseline = 'alphabetic';

			View.context.fillText(card.name, cursor.x, cursor.y);
			cursor.movey(lineHeight*2);
			View.context.fillText('children', cursor.x, cursor.y);
			cursor.movey(lineHeight);
			View.context.font = bodyText;
			let children = card.children.map((child)=>{return child.name}).join(', ') || 'none';
			View.context.fillText(children, cursor.x, cursor.y);

			// TODO: buttons: move, attack, etc.
			cursor.movey(lineHeight*2);
			View.hoveredButton = null;
			for (let btn of View.detailButtons) {
				let hovered = (mouse && btn.rect.contains(mouse));
				if (hovered) { View.hoveredButton = btn; }
				CardShape.drawRoundRect(btn.rect, 10);
				View.context.fillStyle = hovered ? View.colors.button.hoveredFill : View.colors.button.fill;
				View.context.fill();
				View.context.strokeStyle = View.colors.button.border;
				View.context.stroke();
				View.context.font = boldText;
				View.context.fillStyle = hovered ? View.colors.button.hoveredText : View.colors.button.text;
				View.context.textAlign = 'center';
				View.context.textBaseline = 'middle';
				let center = btn.rect.center;
				View.context.fillText(btn.caption, center.x, center.y);
				cursor.movex(btn.size.x+gutter);
			}
		}
		clear(){
			let w = View.canvas.width;
			let h = View.canvas.height;
			let c = View.context;
			c.fillStyle = View.colors.screen.fill;
			c.fillRect(0,0,w,h);
		}
		drawCard(card: Model.Card){
			// orient was called before drawCard
			CardShape.drawBorder(card);
			if(card.parent){
				View.context.fillStyle = View.colors.card.fill;
			}
			else{
				View.context.fillStyle = View.colors.rootCard.fill;
			}
			View.context.strokeStyle = View.colors.card.border;
			View.context.fill();
			View.context.stroke();

			// draw the links
			for (let index = 0; index < card.links.length; ++index){
				let inward = false;
				if (card.links[index] === 0){
					if (index === 0) { inward = true; } else { continue; }
				}
				let apex = card.shape.links[index].clone();
				let center = card.shape.rect.center;
				CardShape.drawLink(apex,center,inward);
				if(card.parent){ View.context.fillStyle = View.colors.card.link; }
				else{ View.context.fillStyle = View.colors.rootCard.link; }
				View.context.fill();
			}

			// draw card name
			let center = card.shape.rect.center;
			View.context.fillStyle = View.colors.text;
			View.context.textAlign = 'center';
			View.context.textBaseline = 'middle';
			View.context.fillText(card.name, center.x, center.y);

			// draw the card's children
			card.links.forEach((child, direction) => {
				if(typeof child !== 'number'){
					
					// console.log(child,direction);

					let childDirection = (card.shape.rotation + direction + 2) % 4;
					CardShape.orient(child, card.shape.links[direction], childDirection);
					this.drawCard(child);
				}
			});
		}
		orientRootCards(factions: Model.Faction[]) { // should be called only once
			factions.forEach((faction, index) => {
				faction.root.shape.rootPoint = new Util.Point(-View.cardLength/2, -View.cardLength/2);
				CardShape.orient(faction.root, faction.root.shape.rootPoint, 0);
			});
		}

		// draw helper functions
		static beginPath(){
			this.context.beginPath();
		}
		static moveTo(p:Util.Point){
			this.context.moveTo(p.x, p.y);
		}
		static lineTo(p:Util.Point){
			this.context.lineTo(p.x, p.y);
		}
		static arcTo(p1:Util.Point, p2:Util.Point, rad=this.getArcSize()){
			this.context.arcTo(p1.x, p1.y, p2.x, p2.y, rad);
		}
		static getArcSize(): number {
			return this.arcRadius * this.cardLength;
		}
	}
}

namespace Control {
	enum State {table, detail, choice, chooseLink};

	export class Control {
		view: View.View;
		factions: Model.Faction[];
		linkTargets: Model.LinkTarget[];
		hoveredCard: Model.Card = null;
		hoveredLink: Model.LinkTarget = null;
		screenState: State = State.table;
		factionIndex = 0;
		mouse: any;
		constructor(){
			this.view = new View.View();
			this.factions = [new Model.Faction()];
			this.view.orientRootCards(this.factions);
			this.view.draw(this.factions, this.hoveredCard);
			this.mouse = {
				down: false,
				drag: false,
				last: null,
			};
		}
		get activeFaction(){
			return this.factions[this.factionIndex];
		}
		beginChooseLink(){
			// TODO: show somehow that the "hovered" card is getting moved (gray out or attach to mouse)
			this.screenState = State.chooseLink;
			this.view.draw(this.factions, this.hoveredCard);
			this.linkTargets = Model.Model.getLinkTargets(this.hoveredCard);
		}
		onMouseDown(event: MouseEvent){
			this.mouse.down = true;
			this.mouse.last = new Util.Point(event.offsetX, event.offsetY);
		}
		onMouseMove(event: MouseEvent){
			if (this.mouse.down) { this.mouse.drag = true; }
			let mouse = new Util.Point(event.offsetX, event.offsetY);
			if (this.screenState === State.table){
				if(this.mouse.drag){
					let delta = mouse.minus(this.mouse.last);
					this.view.dragFocus(delta);
					this.view.draw(this.factions, this.hoveredCard);
				}
				else {
					let hovered = Model.Model.getHoveredCard(mouse);
					if(hovered !== this.hoveredCard){
						this.hoveredCard = hovered;
						this.view.draw(this.factions, this.hoveredCard);
					}
				}
			}
			else if (this.screenState === State.chooseLink) {
				let closest = null;
				let sqDist = 0;
				let minDist = Math.pow(View.View.cardLength, 2);
				for (let target of this.linkTargets) {
					let d2 = mouse.distSquared(target.point);
					if (d2 > minDist) { continue; }
					if (closest===null || d2 < sqDist){
						closest = target;
						sqDist = d2;
					}
				}
				this.hoveredLink = closest;
				this.view.drawLinkChoice(this.factions, this.hoveredCard, closest);
			}
			else if (this.screenState === State.detail) {
				this.view.drawDetail(this.hoveredCard, mouse);
			}
			this.mouse.last = mouse;
		}
		onMouseOut(event: MouseEvent){
			this.mouse.down = false;
			this.mouse.drag = false;
		}
		onMouseUp(event: MouseEvent){
			let mouse = new Util.Point(event.offsetX, event.offsetY);
			if(this.screenState === State.table){
				if(this.mouse.drag){}
				else if(this.hoveredCard){
					this.screenState = State.detail;
					this.view.drawDetail(this.hoveredCard, mouse);
				}
			}
			else if (this.screenState === State.detail) {
				// TODO: buttons, options, etc.
				if (View.View.hoveredButton) {
					let caption = View.View.hoveredButton.caption;
					console.log('clicked button',caption);
					if (caption === 'move') {
						this.beginChooseLink();
					}
				}
				else {
					this.screenState = State.table;
					this.view.draw(this.factions, this.hoveredCard);
				}
			}
			else if (this.screenState === State.chooseLink) {
				// move the card !
				// TODO: check for card overlap
				if (this.hoveredLink) {
					this.hoveredCard.decouple();
					this.hoveredLink.card.addCard(this.hoveredCard, this.hoveredLink.linkIndex);
				}
				this.screenState = State.table;
				this.view.draw(this.factions, this.hoveredCard);
			}

			this.mouse.down = false;
			this.mouse.drag = false;
		}
	}
}

window.addEventListener('load', function () {
	var control = new Control.Control();

	window.addEventListener('mousemove', function(event: MouseEvent) {
		control.onMouseMove(event);
	});

	window.addEventListener('mousedown', function(event: MouseEvent) {
		control.onMouseDown(event);
	});

	window.addEventListener('mouseup', function(event: MouseEvent) {
		control.onMouseUp(event);
	});

	window.addEventListener('mouseout', function(event: MouseEvent) {
		control.onMouseOut(event);
	});

});
