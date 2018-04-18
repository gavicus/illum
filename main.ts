
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

namespace Model {
	export enum CardLocation {deck,hand,open,structure,discard};
	export enum CardType {root,group,special};
	export enum Align {government,communist,liberal,conservative,peaceful,violent,straight,weird,criminal,fanatic};

	export class Model {
		public static factions: Faction[] = [];

		static getHoveredCard(mouse: Util.Point, cardSet: Card[] = Deck.tableCards): Card {
			for (let card of cardSet) {
				if(card.shape.rect.contains(mouse)) { return card; }
			}
			return null;
		}
		static newCard(faction: Faction, name: string, links: number){
			let card = new Card(name, links);
			card.faction = faction;
			return card;
		}
		static getLinkTargets(movingCard: Card, cardSet: Card[] = Deck.structureCards): LinkTarget[] {

			console.log('Model.getLinkTargets');
			console.log('movingCard',movingCard);
			console.log('cardSet',cardSet);

			let faction = movingCard.faction;
			let targets = [];
			for (let card of cardSet) {
				if (card.faction !== faction) { continue; }
				if (card === movingCard){ continue; }
				if (card.isDescendantOf(movingCard)) { continue; }
				for (let index = 0; index < card.links.length; ++index){
					if (card.links[index] !== 1) { continue; }
					targets.push(new LinkTarget(card.shape.links[index], card, index));
				}
			}

			console.log('targets',targets);

			return targets;
		}

		static initFactions(quantity: number) {
			for (let i = 0; i < quantity; ++i) {
				Model.factions.push(new Faction());
			}
		}
	}

	export class LinkTarget {
		constructor(public point: Util.Point, public card: Card, public linkIndex: number){}
	}

	export class Faction {
		root: Card;
		constructor() {
			this.root = Deck.drawRoot();
			this.root.faction = this;
			// this.root = Model.newCard(this, 'root', 4);
			// let child = Model.newCard(this, 'child', 3);
			// this.root.addCard(child, 2);
			// let grand = Model.newCard(this, 'grand1', 1);
			// child.addCard(grand,2);
			// let grand2 = Model.newCard(this, 'grand2', 2);
			// child.addCard(grand2,3);
		}
		public collectIncome() {
			this.root.collectIncome();
		}
	}

	export class Alignment {
		static data = [];
		public static init() {
			Alignment.data[Align.government] = {name:'Government',opp:Align.communist};
			Alignment.data[Align.communist] = {name:'Communist',opp:Align.government};
			Alignment.data[Align.liberal] = {name:'Liberal',opp:Align.conservative};
			Alignment.data[Align.conservative] = {name:'Conservative',opp:Align.liberal};
			Alignment.data[Align.peaceful] = {name:'Peaceful',opp:Align.violent};
			Alignment.data[Align.violent] = {name:'Violent',opp:Align.peaceful};
			Alignment.data[Align.straight] = {name:'Straight',opp:Align.weird};
			Alignment.data[Align.weird] = {name:'Weird',opp:Align.straight};
			Alignment.data[Align.criminal] = {name:'Criminal',opp:null};
			Alignment.data[Align.fanatic] = {name:'Fanatic',opp:Align.fanatic};
		}
		public static getIndex(name: string) {
			for (let i=0; i < Alignment.data.length; ++i) {
				if(Alignment.data[i].name.toLowerCase() === name.toLowerCase()) { return i; }
			}
		}
		public static getName(index: Align) {
			return Alignment.data[index];
		}
		public static getOpposite(index: Align) {
			return Alignment.data[index].opp;
		}
		public static compare(first: string[], second: string[]): any {
			let result = {same:0, opposite:0};
			if (!first) return result;
			for (let fa of first) {
				for (let sa of second) {
					let fi = this.getIndex(fa);
					let si = this.getIndex(sa);
					if (this.data[fi].opp === si) { result.opposite++; }
					else if (fi === si) { result.same++; }
				}
			}
			return result;
		}
	}

	export class Card {
		// TODO: alignments
		name: string;
		faction: Faction;
		linkCount: number;
		parent: Card;
		links: any[];
		shape: any;
		attack: number;
		aid: number;
		defense: number;
		income: number;
		cash = 0;
		description: string;
		objective: string;
		alignments: string[];
		cardLocation: CardLocation;
		cardType: CardType;

		constructor(name: string, links: number=4) {
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
			card.faction = this.faction;
			return true;
		}
		collectIncome() {
			this.cash += this.income;
			for (let child of this.children) {
				child.collectIncome();
			}
		}
		decouple() {
			if(!this.parent) { return; }
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

		static init(text: string): Card {
			let fields = text.split("|");
			let [type,name,description,atk,def,links,income,alignments,objective] = text.split("|");
			let card = new Card(name, parseInt(links));
			card.description = description;
			card.cardLocation = CardLocation.deck;
			if (type !== 'special') {
				let [attack,aid] = atk.split("/");
				card.attack = parseInt(attack);
				card.aid = aid ? parseInt(aid) : 0;
				card.defense = parseInt(def);
				card.income = parseInt(income);
			}
			if (type === 'root'){
				card.objective = objective;
				card.cardType = CardType.root;
			}
			else if (type === 'group'){
				if (alignments.length > 0) { card.alignments = alignments.split(','); }
				else { card.alignments = []; }
				card.cardType = CardType.group;
			}
			else {
				card.cardType = CardType.special;
			}
			return card;
		}
		
	}

	export class Deck {
		static cards: Card[] = [];
		static library = [
				// type|name|description|atk|def|links|income|alignments|objective
				'root|Bavarian Illuminati|May make one privileged attack each turn at a cost of 5MB|10|10|4|9||tbd',
				'root|Bermuda Triangle|May reorganize your groups freely at end of turn|8|8|4|9||tbd',
				'root|Discordian Society|+4 on any attempt to control Weird groups. Immune to attacks from Government or Straight groups.|8|8|4|8||tbd',
				'root|Gnomes of Zurich|May move money freely at end of turn|7|7|4|12||tbd',
				'root|Network|Turns over two cards at beginning of turn|7|7|4|9||tbd',
				'root|Servants of Cthulhu|+2 on any attempt to destroy any group.|9|9|4|7||tbd',
				'root|Society of Assassins|+4 on any attempt to neutralize any group.|8|8|4|8||tbd',
				'root|UFOs|Illuminati group may participate in two attacks per turn.|6|6|4|8||tbd',
				// type|name|description|atk|def|links|income|alignments
				'group|Big Media||4/3|6|3|3|Straight,Liberal',
				'group|C.I.A.||6/4|5|3|0|Government,Violent',
				'group|California||5|4|2|5|Weird,Liberal,Government',
				'group|Democrats||5|4|2|3|Liberal',
				'group|F.B.I.||4/2|6|2|0|Government,Straight',
				'group|Hollywood||2|0|2|5|Liberal',
				'group|I.R.S.|Owning player may tax each opponent 2MB on his own income phase. Tax may come from any group. If a player has no money, he owes no tax.|5/3|5|2|*|Criminal,Government',
				'group|KGB||2/2|6|1|0|Communist,Violent',
				'group|Mafia||7|7|3|6|Criminal,Violent',
				'group|New York||7|8|3|3|Violent,Criminal,Government',
				'group|Republicans||4|4|3|4|Conservative',
				'group|Texas||6|6|2|4|Violent,Conservative,Government',
				//
		];

		static init () {
			for (let text of Deck.library) {
				Deck.cards.push(Card.init(text));
			}
		}

		static drawCard (collection,filter): Card {
			let available = collection.filter((card) => {
				if (card.cardLocation !== CardLocation.deck) { return false; }
				return filter(card);
			});
			let draw = available[Util.randomInt(0,available.length-1)];
			draw.cardLocation = CardLocation.structure;
			return draw;
		}

		static drawRoot (): Card {
			return Deck.drawCard(Deck.cards, (card) => {return card.cardType === CardType.root;});
		}

		static drawPlot () {
			return Deck.drawCard(Deck.cards, (card) => {return card.cardType !== CardType.root;});
		}

		static drawGroup () {
			return Deck.drawCard(Deck.cards, (card) => {return card.cardType === CardType.group;})
		}

		static get structureCards () {
			return Deck.cards.filter((card) => {
				return card.cardLocation === CardLocation.structure
					&& card.faction === Control.Turn.factionShown;
			});
		}

		static get tableCards () {
			return Deck.openCards.concat(Deck.structureCards);
		}

		static get openCards () {
			return Deck.cards.filter((card) => { return card.cardLocation === CardLocation.open; });
		}
	}
}

namespace View {
	export enum State {table, detail, choice, chooseLink, attackSetup};
	
	export class View {
		static screenState: State = State.table;
		static readonly arcRadius = 0.15;
		static readonly widthRatio = 0.7;
		static canvas: HTMLCanvasElement;
		static context: CanvasRenderingContext2D;
		static cardLength = 50; // changes with zoom
		static detailButtons: Button[];
		static factionButtons: Button[];
		static hoveredButton: Button = null;
		static hoveredCard: Model.Card = null;
		static focus: Util.Point;
		static textSize = 10;
		static colors = {
			card: {
				border: '#bbb',
				link: '#444',
				fill: '#f0f0f0',
				text: 'gray',
				hoveredBorder: '#f80',
				cash: 'orange',
			},
			rootCard: {
				fill: '#888',
				link: '#fff',
				text: 'white',
			},
			screen: {
				fill: '#f8f8f8',
				headerFill: '#eee',
			},
		};

		public static init () {
			View.canvas = <HTMLCanvasElement>document.getElementById('canvas');
			View.context = View.canvas.getContext('2d');
			View.focus = new Util.Point(View.canvas.width/2, View.canvas.height/2);
			View.detailButtons = [
				new Button('move', Control.Control.btnMoveGroup, new Util.Point(20, 100)),
				new Button('attack', Control.Control.btnAttack, new Util.Point(100,100)),
			];
			// faction selection buttons
			View.factionButtons = [];
			let cursor = new Util.Point(10,View.canvas.height-10);
			for (let i=Model.Model.factions.length-1; i>=0; --i) {
				let faction = Model.Model.factions[i];
				let btn = new Button(faction.root.name, Control.Control.btnShowFaction, cursor.clone());
				btn.data = faction;
				btn.outline = false;
				btn.textPoint = cursor.clone();
				btn.textAlign = 'left';
				btn.data = faction;
				View.factionButtons.push(btn);
				cursor.movey(-14);
			}
			this.orientRootCards(Model.Model.factions);

			PageAttack.init();

			this.draw();
		}
		public static dragFocus(delta: Util.Point) {
			View.focus.move(delta.x, delta.y);
		}
		public static draw(){
			this.clear();

			// structure
			let faction = Control.Turn.factionShown;
			CardShape.orient(faction.root, faction.root.shape.rootPoint.plus(View.focus), 0);
			this.drawCard(faction.root);
			
			// header: uncontrolled
			View.context.fillStyle = View.colors.screen.headerFill;
			View.context.fillRect(0,0, View.canvas.width, View.cardLength * 1.4);
			let open = Model.Deck.openCards;
			let cursor = new Util.Point(View.cardLength/2, 10);
			for (let card of open) {
				CardShape.orient(card, cursor, 1);
				View.drawCard(card);
				cursor.movex(View.cardLength);
			}

			// footer: faction selection, hand, buttons
			let height = View.cardLength * 1.4;
			View.context.fillStyle = View.colors.screen.headerFill;
			View.context.fillRect(0,View.canvas.height-height, View.canvas.width, height);
			// faction selection
			for (let btn of View.factionButtons) {
				if (btn.data === Control.Turn.faction) { btn.font = View.boldFont; }
				else { btn.font = View.font; }
				btn.draw(View.context, btn === View.hoveredButton);
			}

			// hovered
			if(View.hoveredCard){
				CardShape.drawBorder(View.hoveredCard);
				View.context.strokeStyle = View.colors.card.hoveredBorder;
				View.context.stroke();
			}
		}
		public static drawLinkChoice(closest){
			View.draw();
			if (!closest) { return; }
			View.beginPath();
			View.context.arc(closest.point.x, closest.point.y, View.getArcSize(), 0, 2*Math.PI, false);
			View.context.strokeStyle = 'red';
			View.context.stroke();
		}
		public static drawDetail(card: Model.Card, mouse: Util.Point = null) {

			// TODO:
			// long description lines must wrap (see IRS)
			// IRS income shows as NaN -- make exceptions for special cases

			View.clear();
			let gutter = 20;
			let lineHeight = 16;
			let cursor = new Util.Point(gutter, gutter);
			// name
			View.context.font = View.boldFont;
			View.context.fillStyle = View.colors.card.text;
			View.context.textAlign = 'left';
			View.context.textBaseline = 'alphabetic';
			let cardName = card.name;
			if (card.cardType === Model.CardType.root) {
				cardName = 'The ' + card.name;
			}
			View.context.fillText(cardName, cursor.x, cursor.y);
			cursor.movey(lineHeight);
			View.context.fillText('(' + card.alignments + ')', cursor.x, cursor.y);
			
			// numbers
			cursor.movey(lineHeight);
			View.context.font = View.font;
			let atk = '' + card.attack;
			if(card.aid > 0) { atk += '/' + card.aid; }
			let def = card.defense;
			View.context.fillText('attack: ' + atk + '  defense: ' + def, cursor.x, cursor.y);
			cursor.movey(lineHeight);
			View.context.fillText('income: '+card.income, cursor.x, cursor.y);
			// description
			cursor.movey(lineHeight);
			View.context.fillText(card.description, cursor.x, cursor.y);
			// children
			cursor.movey(lineHeight*2);
			View.context.fillText('children', cursor.x, cursor.y);
			cursor.movey(lineHeight);
			View.context.font = View.font;
			let children = card.children.map((child)=>{return child.name}).join(', ') || 'none';
			View.context.fillText(children, cursor.x, cursor.y);

			// TODO: buttons: move, attack, etc.
			cursor.movey(lineHeight*2);
			View.hoveredButton = null;
			for (let btn of View.detailButtons) {
				if (btn.caption === 'move') {
					if (card.cardType === Model.CardType.root) { continue; } // make root immobile
					if (card.cardLocation === Model.CardLocation.open) { continue; } // make uncontrolled cards immobile
				}
				else if (btn.caption === 'attack') {
					if (card.cardLocation !== Model.CardLocation.structure) { continue; }
					if (card.faction !== Control.Turn.faction) { continue; }
					// TODO: allow for groups that can act twice
					if (Control.Turn.getHasActed(card)) { continue; }
				}
				btn.moveTo(cursor);
				let hovered = (mouse && btn.rect.contains(mouse));
				if (hovered) { View.hoveredButton = btn; }

				CardShape.drawRoundRect(btn.rect, 10);
				View.context.fillStyle = hovered ? Button.colors.hoveredFill : Button.colors.fill;
				View.context.fill();
				View.context.strokeStyle = Button.colors.border;
				View.context.stroke();
				View.context.font = View.boldFont;
				View.context.fillStyle = hovered ? Button.colors.hoveredText : Button.colors.text;
				View.context.textAlign = 'center';
				View.context.textBaseline = 'middle';
				let center = btn.rect.center;
				View.context.fillText(btn.caption, center.x, center.y);

				cursor.movex(Button.size.x+gutter);
			}
		}
		public static clear(){
			let w = View.canvas.width;
			let h = View.canvas.height;
			let c = View.context;
			c.fillStyle = View.colors.screen.fill;
			c.fillRect(0,0,w,h);
		}
		public static drawCard(card: Model.Card){
			CardShape.drawBorder(card);
			if(card.cardType === Model.CardType.group){
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
				if(card.cardType === Model.CardType.group){
					View.context.fillStyle = View.colors.card.link;
				} else{ View.context.fillStyle = View.colors.rootCard.link; }
				View.context.fill();
			}

			// draw has-acted icon
			if (Control.Turn.getHasActed(card)) {
				let center = new Util.Point(card.shape.rect.lowerRight.x, card.shape.rect.upperLeft.y);
				let radius = View.cardLength * CardShape.arrowSize;
				center.move(-radius, radius);
				View.context.arc(center.x, center.y, radius-2, 0, Math.PI*2);
				View.context.fillStyle =
					card.cardType === Model.CardType.group
					? View.colors.card.link
					: View.colors.rootCard.link;
				View.context.fill();
			}

			// draw card name
			let center = card.shape.rect.center;
			if(card.cardType === Model.CardType.group){
				View.context.fillStyle = View.colors.card.text;
			} else {
				View.context.fillStyle = View.colors.rootCard.text;
			}
			View.context.font = View.font;
			View.context.textAlign = 'center';
			View.context.textBaseline = 'middle';
			View.context.fillText(
				card.name.substring(0,View.cardLength/8),
				center.x, center.y
			);

			// draw card cash
			if (card.cardLocation === Model.CardLocation.structure) {
				let cursor = card.shape.rect.lowerRight.clone();
				cursor.move(-2,-2);
				View.context.textAlign = 'right';
				View.context.textBaseline = 'alphabetic';
				View.context.fillStyle = View.colors.card.cash;
				View.context.fillText(''+card.cash, cursor.x, cursor.y);
			}

			// draw the card's children
			card.links.forEach((child, direction) => {
				if(typeof child !== 'number'){
					let childDirection = (card.shape.rotation + direction + 2) % 4;
					CardShape.orient(child, card.shape.links[direction], childDirection);
					this.drawCard(child);
				}
			});
		}
		public static drawPage(){
			View.clear();
			if (View.screenState === State.attackSetup) { PageAttack.draw(View.context); }
		};
		public static getHoveredButton(btnSet: Button[], mouse: Util.Point): Button {
			for (let btn of btnSet) {
				if(btn.hovered(mouse)) { return btn; }
			}
			return null;
		}
		public static orientRootCards(factions: Model.Faction[]) { // should be called only once
			factions.forEach((faction, index) => {
				faction.root.shape.rootPoint = new Util.Point(-View.cardLength/2, -View.cardLength/2);
				CardShape.orient(faction.root, faction.root.shape.rootPoint, 0);
			});
		}
		public static get font(): string {
			return View.textSize + "px sans-serif";
		}
		public static get boldFont(): string {
			return "bold " + View.textSize + "px sans-serif";
		}

		// page events
		public static onMouseMove(mouse: Util.Point) {
			if (this.screenState === State.attackSetup) {
				PageAttack.onMouseMove(mouse);
			}
		}
		public static onMouseClick(mouse: Util.Point) {
			if (this.screenState === State.attackSetup) {
				PageAttack.onMouseClick(mouse);
			}
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

	export class Button {
		public static readonly size = new Util.Point(80, 18);
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

	enum AttackState {setup, success, failure};
	
	export class PageAttack {
		public static state: AttackState;
		public static buttons: Button[] = [];
		public static hoveredButton: Button = null;
		public static attackType = 'control';
		public static roll = 0;

		public static init() {
			this.reset();
			let lineHeight = 22;
			let cursor = new Util.Point(10,150);
			this.buttons.push( new Button('execute', this.btnExecuteAttack, cursor) );
			cursor.movey(lineHeight);
			this.buttons.push( new Button('cancel', this.btnCancelAttack, cursor) );
			cursor.set(View.canvas.width - Button.size.x - 10, 10);
			let cmd1 = new Button('control', PageAttack.btnAtkType, new Util.Point(cursor.x, cursor.y));
			cursor.movey(lineHeight);
			let cmd2 = new Button('neutralize', PageAttack.btnAtkType, new Util.Point(cursor.x, cursor.y));
			cursor.movey(lineHeight);
			let cmd3 = new Button('destroy', PageAttack.btnAtkType, new Util.Point(cursor.x, cursor.y));
			cmd1.selected = true;
			let data = {group:[cmd1,cmd2,cmd3]};
			cmd1.data = data;
			cmd2.data = data;
			cmd3.data = data;
			let done = new Button('done', PageAttack.btnDone, new Util.Point(10,200));
			done.visible = false;
			this.buttons.push(cmd1,cmd2,cmd3,done);
		}

		public static reset() {
			PageAttack.state = AttackState.setup;
			PageAttack.roll = 0;
			for (let btn of PageAttack.buttons) {
				if (btn.caption === 'done') { btn.visible = false; }
				else { btn.visible = true; }
			}
		}
		public static initDoneState() {
			for (let btn of PageAttack.buttons) {
				if (btn.caption === 'done') { btn.visible = true; }
				else { btn.visible = false; }
			}
		}

		public static get attackTotal() { return Control.Attack.attacker.attack; }
		public static get defenseTotal() { return Control.Attack.defender.defense; }

		public static draw (ctx: CanvasRenderingContext2D) {

			console.log('PageAttack.draw',PageAttack.attackType);

			let leftMargin = 10;
			let lineHeight = 15;

			let defenseAttribute = Control.Attack.defender.defense;
			if(PageAttack.attackType === 'destroy') {
				defenseAttribute = Control.Attack.defender.attack;
			}

			// TODO: compute target proximity to root card
			// TODO: allow use of cash
			// TODO: disallow control attacks if attacker has no open out links
			// TODO: figure in card special abilities
			// TODO: newly-controlled cards get their cash halved

			let cursor = new Util.Point(leftMargin,lineHeight);
			ctx.fillStyle = View.colors.card.text;
			ctx.font = View.font;
			ctx.textAlign = 'left';
			ctx.textBaseline = 'alphabetic';
			let typeLine = 'attack type: ' + PageAttack.attackType;
			ctx.fillText(typeLine, cursor.x, cursor.y);
			cursor.movey(lineHeight);
			let atkLine = 'attacker: '+Control.Attack.attacker.name + ' (' + Control.Attack.attacker.attack + ')';
			atkLine += ' (' + Control.Attack.attacker.alignments + ')';
			ctx.fillText(atkLine, cursor.x, cursor.y);
			cursor.movey(lineHeight);
			let defLine = 'defender: '+ Control.Attack.defender.name + ' (' + defenseAttribute + ')';
			defLine += ' (' + Control.Attack.defender.alignments + ')';
			ctx.fillText(defLine, cursor.x, cursor.y);

			// compute totals
			let comparison = Model.Alignment.compare(Control.Attack.attacker.alignments, Control.Attack.defender.alignments);
			let alignBonus = 0;
			if(PageAttack.attackType === 'control') {
				alignBonus = comparison.same * 4 - comparison.opposite * 4;
			}
			else if(PageAttack.attackType === 'neutralize') {
				alignBonus = 6 + comparison.same * 4 - comparison.opposite * 4;
			}
			else if(PageAttack.attackType === 'destroy') {
				alignBonus = comparison.opposite * 4 - comparison.same * 4;
			}
			let totalAtk = Control.Attack.attacker.attack + alignBonus;
			let totalDef = defenseAttribute;

			// show totals
			cursor.movey(lineHeight*2);
			let cursor2 = cursor.clone();
			ctx.fillText('total attack: '+totalAtk, cursor.x, cursor.y);
			cursor.movey(lineHeight);
			ctx.fillText('total defense: '+totalDef, cursor.x, cursor.y);
			cursor.movey(lineHeight);
			ctx.fillText('roll needed: '+ (totalAtk - totalDef) + ' or less', cursor.x, cursor.y);

			// show bonuses
			cursor2.movex(120);
			ctx.fillText('alignment bonus: ' + alignBonus, cursor2.x, cursor2.y);
			cursor2.movey(lineHeight);
			ctx.fillText('illuminati defense: ' + 0, cursor2.x, cursor2.y); // TODO

			cursor.movey(lineHeight*2);
			if (PageAttack.roll > 0) {
				ctx.fillText('roll: ' + PageAttack.roll, cursor.x, cursor.y);
				cursor.movey(lineHeight);
				if (PageAttack.state === AttackState.success) {
					ctx.fillText('success!',cursor.x,cursor.y);
				}
				else {
					ctx.fillText('failure!',cursor.x,cursor.y);
				}
			}

			// buttons
			for (let btn of this.buttons) {
				btn.draw(ctx, btn === this.hoveredButton);
			}
		}

		// button events
		public static btnAtkType(button: View.Button) {

			console.log('btnAtkType',button);

			for (let btn of button.data.group) {
				btn.selected = false;
			}
			button.selected = true;
			PageAttack.attackType = button.caption;

			console.log('this.attackType',PageAttack.attackType);

			View.drawPage();
		}
		public static btnExecuteAttack(button: Button) {
			// TODO: spend cash used in attack
			Control.Turn.setHasActed(Control.Attack.attacker);
			PageAttack.roll = Util.randomInt(1,6) + Util.randomInt(1,6);

			// let needed = PageAttack.attackTotal - PageAttack.defenseTotal;
			let needed = 12; // testing

			if(PageAttack.roll < needed) {
				PageAttack.state = AttackState.success;
			}
			else {
				PageAttack.state = AttackState.failure;
			}
			PageAttack.initDoneState();
			View.drawPage();
		}
		public static btnCancelAttack(button: Button) {
			Control.Control.cancelAttack();
			View.screenState = State.table;
			PageAttack.reset();
			View.draw();
		}
		public static btnDone(button: Button) {
			View.screenState = State.table;
			if (PageAttack.state === AttackState.failure) {
				Control.Control.cancelAttack();
			}
			else if (PageAttack.attackType === 'control') {
				Control.Control.controlSuccess();
			}
			else if (PageAttack.attackType === 'neutralize') {
				Control.Control.neutralizeSuccess();
			}
			else if (PageAttack.attackType === 'destroy') {
				Control.Control.destroySuccess();
			}
			PageAttack.reset();
			View.draw();
		}
		
		// mouse event
		public static onMouseMove(mouse: Util.Point) {
			let buttonSet = this.buttons.filter((btn) => btn.visible===true);
			this.hoveredButton = Button.getHoveredButton(buttonSet, mouse);
			View.drawPage();
		}
		public static onMouseClick(mouse: Util.Point) {
			if (this.hoveredButton) {
				this.hoveredButton.callback(this.hoveredButton);
			}
		}
		
	}
}

namespace Control {
	export enum Command {none, placeCard, attack};

	export class Control {
		public static linkTargets: Model.LinkTarget[];
		public static hoveredCard: Model.Card = null;
		public static hoveredLink: Model.LinkTarget = null;
		public static mouse: any;
		public static command: Command = null;
		public static attacker: Model.Card = null;
		public static defender: Model.Card = null;

		public static init(){
			Model.Deck.init();
			Model.Model.initFactions(2);
			Model.Alignment.init();
			Turn.initTurn(0);
			
			for (let i=0; i<4; ++i) {
				let card = Model.Deck.drawGroup().cardLocation = Model.CardLocation.open;
			}
			View.View.init();

			this.mouse = {
				down: false,
				drag: false,
				last: null,
			};
		}

		public static beginChooseLink(cardToPlace: Model.Card, cardSet: Model.Card[] = Model.Deck.structureCards){
			// TODO: show somehow that the "hovered" card is getting moved (gray out or attach to mouse)
			View.View.screenState = View.State.chooseLink;
			this.linkTargets = Model.Model.getLinkTargets(View.View.hoveredCard, cardSet);

			console.log('beginChooseLink');
			console.log('cardToPlace',cardToPlace);
			console.log('cardSet', cardSet);
			console.log('linkTargets',this.linkTargets);

			View.View.draw();
		}
		public static beginChooseTarget(){
			View.View.screenState = View.State.table;
			View.View.canvas.style.cursor = 'crosshair';
			View.View.draw();
		}
		public static cancelAttack() {
			Attack.clear();
			this.command = Command.none;
		}
		
		public static restoreTableState() {
			View.View.screenState = View.State.table;
			Turn.factionShownIndex = Turn.factionIndex;
			View.View.draw();
		}
		public static controlSuccess() {
			Control.restoreTableState();
			Attack.defender.faction = Attack.attacker.faction;
			Attack.defender.cardLocation = Model.CardLocation.structure;
			Control.beginChooseLink(Attack.defender, [Attack.attacker]);
		}
		public static neutralizeSuccess() {
			Control.restoreTableState();
		}
		public static destroySuccess() {
			Control.restoreTableState();
		}

		public static onMouseDown(event: MouseEvent){
			this.mouse.down = true;
			this.mouse.drag = false;
			this.mouse.last = new Util.Point(event.offsetX, event.offsetY);
		}
		public static onMouseMove(event: MouseEvent){
			let mouse = new Util.Point(event.offsetX, event.offsetY);
			if (this.mouse.down && !mouse.equals(this.mouse.last)) {
				this.mouse.drag = true;
			}
			if (View.View.screenState === View.State.table){
				let dirty = false;
				if(this.mouse.drag){
					let delta = mouse.minus(this.mouse.last);
					View.View.dragFocus(delta);
					dirty = true;
				}
				else {
					let hovered = Model.Model.getHoveredCard(mouse, Model.Deck.tableCards);
					if(hovered !== View.View.hoveredCard){
						View.View.hoveredCard = hovered;
						dirty = true;
					}
					let btn = View.View.getHoveredButton(View.View.factionButtons, mouse);
					if (btn !== View.View.hoveredButton) {
						View.View.hoveredButton = btn;
						dirty = true;
					}
				}
				if (dirty) { View.View.draw(); }
			}
			else if (View.View.screenState === View.State.chooseLink) {
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
				View.View.drawLinkChoice(closest);
			}
			else if (View.View.screenState === View.State.detail) {
				View.View.drawDetail(View.View.hoveredCard, mouse);
			}
			else { View.View.onMouseMove(mouse); }
			this.mouse.last = mouse;
		}
		public static onMouseOut(event: MouseEvent){
			this.mouse.down = false;
			this.mouse.drag = false;
		}
		public static onMouseUp(event: MouseEvent){
			let mouse = new Util.Point(event.offsetX, event.offsetY);
			
			if(View.View.screenState === View.State.table){
				if(this.mouse.drag){}
				else if (View.View.hoveredButton) {
					View.View.hoveredButton.callback(View.View.hoveredButton);
 				}
				else if (View.View.hoveredCard){
					if (this.command == Command.attack) {
						// TODO: allow cancel
						View.View.canvas.style.cursor = '';
						Attack.setDefender(View.View.hoveredCard);
						View.View.screenState = View.State.attackSetup;
						View.PageAttack.reset();
						View.View.drawPage();

						// Turn.setHasActed(this.attacker);

						// TODO: handle control attempt

						// View.View.hoveredCard.cardLocation = Model.CardLocation.structure;

						// TODO: new card should only link to controlling card
						// place the newly controlled card

						// this.beginChooseLink([this.attacker]);
						// this.command = null;

					}
					else {
						View.View.screenState = View.State.detail;
						View.View.drawDetail(View.View.hoveredCard, mouse);
					}
				}
			}
			else if (View.View.screenState === View.State.detail) {
				// TODO: buttons, options, etc.
				if (View.View.hoveredButton) {
					// let caption = View.View.hoveredButton.caption;
					// if (caption === 'move') {
					// 	this.beginChooseLink();
					// } else if (caption === 'control') {
					// 	Attack.setAttacker(View.View.hoveredCard);
					// 	this.command = Command.attack;
					// 	this.beginChooseTarget();
					// }
					View.View.hoveredButton.callback(View.View.hoveredButton);
				}
				else {
					View.View.screenState = View.State.table;
					View.View.draw();
				}
			}
			else if (View.View.screenState === View.State.chooseLink) {
				// move the card !
				// TODO: check for card overlap
				if (this.hoveredLink) {
					View.View.hoveredCard.decouple();
					this.hoveredLink.card.addCard(View.View.hoveredCard, this.hoveredLink.linkIndex);
					this.command = Command.none;
				}
				View.View.screenState = View.State.table;
				View.View.canvas.style.cursor = 'arrow';
				View.View.draw();
			}
			else {
				if(this.mouse.drag){}
				else { View.View.onMouseClick(mouse); }
			}

			this.mouse.down = false;
			this.mouse.drag = false;
		}
	
		public static btnAttack(button: View.Button) {
			Attack.setAttacker(View.View.hoveredCard);
			Control.command = Command.attack;
			Control.beginChooseTarget();
		}
		public static btnMoveGroup(button: View.Button) {
			console.log('btnMoveGroup');
		}
		public static btnShowFaction(button: View.Button) {
			console.log('btnShowFaction', button.data);
			Turn.factionShownIndex = Model.Model.factions.indexOf(button.data);
			View.View.draw();
		}
	}

	export class Attack {
		private static _attacker: Model.Card;
		private static _defender: Model.Card;
		public static clear(){
			this._attacker = null;
			this._defender = null;
		}
		public static setAttacker(a:Model.Card){
			this._attacker = a;
		}
		public static setDefender(d:Model.Card){
			this._defender = d;
		}
		public static get attacker(){ return Attack._attacker; }
		public static get defender(){ return Attack._defender; }
	}

	export class Turn {
		static factionIndex: number;
		static factionShownIndex: number;
		static hasActed: Model.Card[];
		static hasActedTwice: Model.Card[];

		static initTurn(factionIndex: number): void {
			Turn.factionIndex = factionIndex;
			Turn.factionShownIndex = factionIndex;
			Turn.hasActed = [];
			Turn.hasActedTwice = [];
			Turn.faction.collectIncome();
		}

		static getHasActed(group: Model.Card): boolean {
			return Turn.hasActed.indexOf(group) > -1;
		}

		static getHasActedTwice(group: Model.Card): boolean {
			return Turn.hasActedTwice.indexOf(group) > -1;
		}

		static setHasActed(group: Model.Card): void {
			Turn.hasActed.push(group);
		}

		static setHasActedTwice(group: Model.Card): void {
			Turn.hasActedTwice.push(group);
		}

		static get faction(): Model.Faction {
			return Model.Model.factions[Turn.factionIndex];
		}

		static get factionShown(): Model.Faction {
			return Model.Model.factions[Turn.factionShownIndex];
		}
	}
}

window.addEventListener('load', function () {
	Control.Control.init();

	window.addEventListener('mousemove', function(event: MouseEvent) {
		Control.Control.onMouseMove(event);
	});

	window.addEventListener('mousedown', function(event: MouseEvent) {
		Control.Control.onMouseDown(event);
	});

	window.addEventListener('mouseup', function(event: MouseEvent) {
		Control.Control.onMouseUp(event);
	});

	window.addEventListener('mouseout', function(event: MouseEvent) {
		Control.Control.onMouseOut(event);
	});

});
