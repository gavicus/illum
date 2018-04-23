// TODO: disallow control attacks if attacker has no open out links
// TODO: figure in card special abilities
// TODO: newly-controlled cards get their cash halved
// TODO: move faction view buttons from View to PageView

namespace View {
	export enum State {table, detail, choice, attackSetup};
	export enum AttackState {setup, success, failure};
	export enum TableState {normal, chooseLink};

	export class CardView {
		static arrowSize = 0.1;
		static cornerSize = 0.15;
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
		};

		static draw(ctx: CanvasRenderingContext2D, card: Model.Card) {

			// border
			CardView.drawBorder(card);
			if(card.cardType === Model.CardType.group){
				ctx.fillStyle = CardView.colors.card.fill;
			}
			else{
				ctx.fillStyle = CardView.colors.rootCard.fill;
			}
			ctx.strokeStyle = CardView.colors.card.border;
			ctx.fill();
			ctx.stroke();

			// links
			for (let index = 0; index < card.links.length; ++index){
				let inward = false;
				if (card.links[index] === 0){
					if (index === 0) { inward = true; } else { continue; }
				}
				let apex = card.shape.links[index].clone();
				let center = card.shape.rect.center;
				CardView.drawLink(apex,center,inward);
				if(card.cardType === Model.CardType.group){
					View.context.fillStyle = CardView.colors.card.link;
				} else{ View.context.fillStyle = CardView.colors.rootCard.link; }
				View.context.fill();
			}

			// draw has-acted icon
			if (View.turnObject.getHasActed(card)) {
				let center = new Util.Point(card.shape.rect.lowerRight.x, card.shape.rect.upperLeft.y);
				let radius = View.cardLength * CardView.arrowSize;
				center.move(-radius, radius);
				View.context.arc(center.x, center.y, radius-2, 0, Math.PI*2);
				View.context.fillStyle =
					card.cardType === Model.CardType.group
					? CardView.colors.card.link
					: CardView.colors.rootCard.link;
				View.context.fill();
			}

			// draw card name
			let center = card.shape.rect.center;
			if(card.cardType === Model.CardType.group){
				View.context.fillStyle = CardView.colors.card.text;
			} else {
				View.context.fillStyle = CardView.colors.rootCard.text;
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
				View.context.fillStyle = CardView.colors.card.cash;
				View.context.fillText(''+card.cash, cursor.x, cursor.y);
			}

			// draw the card's children
			card.links.forEach((child, direction) => {
				if(typeof child !== 'number'){
					let childDirection = (card.shape.rotation + direction + 2) % 4;
					CardView.orient(child, card.shape.links[direction], childDirection);
					CardView.draw(ctx, child);
				}
			});
			
		}
		static drawBorder(card: Model.Card){
			this.drawRoundRect(card.shape.rect, View.getArcSize());
		}
		static drawHovered(card: Model.Card, ctx: CanvasRenderingContext2D) {
			CardView.drawBorder(card);
			ctx.strokeStyle = CardView.colors.card.hoveredBorder;
			ctx.stroke();
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
			let arrowSize = View.cardLength * CardView.arrowSize;
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
		public static size = new Util.Point(80,18);
		public rect: Util.Rectangle;
		public font = View.boldFont;
		public outline = true;
		public selected = false;
		public visible = true;
		public textAlign = 'center';
		public data: any;
		static colors = {
			fill: '#efefef',
			border: '#ccc',
			text: 'gray',
			hoveredFill: 'gray',
			hoveredText: 'orange',
			selectedFill: '#ccf',
		};

		constructor (
			public caption: string, public callback: (button: View.Button) => void,
			private ulCorner: Util.Point, public id: string=''
		) {
			this.rect = new Util.Rectangle(ulCorner.x, ulCorner.y, Button.size.x, Button.size.y);
		}
		
		static getButton (buttonSet: Button[], id: string) {
			return buttonSet.find((btn) => btn.id === id);
		}
		static getHoveredButton (buttonSet: Button[], mouse: Util.Point): Button {
			for (let btn of buttonSet) {
				if(btn.hovered(mouse)) { return btn; }
			}
			return null;
		}

		get textPoint(): Util.Point {
			if(this.textAlign==='center'){ return this.rect.center; }
			else {
				let x = this.rect.upperLeft.x;
				let y = this.rect.upperLeft.y + Button.size.y/3;
				return new Util.Point(x, y);
			}
		}
		draw (c: CanvasRenderingContext2D, hovered: boolean) {
			if (!this.visible) { return; }
			if (this.outline) {
				CardView.drawRoundRect(this.rect, 10);

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
		sety (y: number): void {
			this.rect.upperLeft.y = y;
			this.rect.lowerRight.y = y + Button.size.y;
		}
	}

	export class View {
		static screenState: State;
		static readonly arcRadius = 0.15;
		static readonly widthRatio = 0.7;
		static canvas: HTMLCanvasElement;
		static context: CanvasRenderingContext2D;
		static cardLength = 50; // changes with zoom
		static hoveredButton: Button = null;
		static hoveredCard: Model.Card = null;
		static focus: Util.Point;
		static textSize = 10;
		static callback: (data:any) => any;
		static turnObject: any;
		static colors = {
			screen: {
				fill: '#f8f8f8',
				headerFill: '#eee',
			},
		};

		public static init (controlCallback: (data:any) => any, turnObj: any) {
			View.callback = controlCallback;
			View.turnObject = turnObj;
			View.screenState = State.table;
			View.canvas = <HTMLCanvasElement>document.getElementById('canvas');
			View.context = View.canvas.getContext('2d');
			View.focus = new Util.Point(View.canvas.width/2, View.canvas.height/2);
			// View.detailButtons = [
			// 	new Button('move', View.callback('btnMoveGroup'), new Util.Point(20, 100)),
			// 	new Button('attack', View.callback('btnAttack'), new Util.Point(100,100)),
			// ];
			this.orientRootCards(Model.Model.factions);

			this.drawPage();
		}
		public static dragFocus(delta: Util.Point) {
			View.focus.move(delta.x, delta.y);
		}
		public static clear(){
			let w = View.canvas.width;
			let h = View.canvas.height;
			let c = View.context;
			c.fillStyle = View.colors.screen.fill;
			c.fillRect(0,0,w,h);
		}

		public static drawPage(){
			View.clear();
			if (View.screenState === State.attackSetup) { PageAttack.draw(View.context); }
			else if (View.screenState === State.table) { PageTable.draw(View.context); }
			else if (View.screenState === State.detail) { PageDetail.draw(View.context); }
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
				CardView.orient(faction.root, faction.root.shape.rootPoint, 0);
			});
		}
		public static get font(): string {
			return View.textSize + "px sans-serif";
		}
		public static get boldFont(): string {
			return "bold " + View.textSize + "px sans-serif";
		}

		// page events
		public static onMouseMove(mouse: Util.Point, dragDelta: Util.Point = null) {
			switch (this.screenState) {
				case State.attackSetup: PageAttack.onMouseMove(mouse); break;
				case State.table: PageTable.onMouseMove(mouse); break;
				case State.detail: PageDetail.onMouseMove(mouse); break;
			}
		}
		public static onMouseClick(mouse: Util.Point) {
			switch (this.screenState) {
				case State.attackSetup: PageAttack.onMouseClick(mouse); break;
				case State.table: PageTable.onMouseClick(mouse); break;
				case State.detail: PageDetail.onMouseClick(mouse); break;
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

	export class PageAttack {
		public static state: AttackState;
		public static buttons: Button[] = [];
		public static hoveredButton: Button = null;
		public static attackType = 'control';
		public static attackerCash = 0;
		public static rootCash = 0;
		public static roll = 0;
		public static callback: (data:any) => any;
		public static colors = {
			text: 'gray',
		};

		public static init(atkCallback: (data:any) => any) {
			PageAttack.callback = atkCallback;

			this.reset();
			let lineHeight = 22;
			let cursor = new Util.Point(0,0);

			// attack type
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
			this.buttons.push(cmd1,cmd2,cmd3);

			// done
			cursor.movey(lineHeight*3);
			let done = new Button('done', PageAttack.btnDone, cursor);
			done.visible = false;
			this.buttons.push(done);

			// leverage cash buttons
			cursor.movex(-Button.size.x-5);
			cursor.movey(lineHeight*2);
			this.buttons.push(new Button('more',PageAttack.btnOwnCashMore,cursor,'own_cash_more'));
			this.buttons.push(new Button('less',PageAttack.btnOwnCashLess,cursor.shifted(Button.size.x+5,0),'own_cash_less'));
			cursor.movey(lineHeight*2);
			let rootMore = new Button('more',PageAttack.btnRootCashMore,cursor,'root_cash_more');
			let rootLess = new Button('less',PageAttack.btnRootCashLess,cursor.shifted(Button.size.x+5,0),'root_cash_less');
			this.buttons.push(rootMore,rootLess);
			
			// exec & cancel
			cursor.movey(lineHeight*2);
			this.buttons.push( new Button('execute', PageAttack.btnExecuteAttack, cursor, 'execute') );
			this.buttons.push( new Button('cancel', PageAttack.btnCancelAttack, cursor.shifted(Button.size.x+5,0), 'cancel') );

		}

		public static reset() {
			PageAttack.state = AttackState.setup;
			PageAttack.roll = 0;
			PageAttack.attackerCash = 0;
			PageAttack.rootCash = 0;
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
		public static draw (ctx: CanvasRenderingContext2D) {
			let leftMargin = 10;
			let lineHeight = 15;
			let attacker = PageAttack.callback({command:'getAttacker'});
			let defender = PageAttack.callback({command:'getDefender'});

			let cursor = new Util.Point(leftMargin,lineHeight);
			ctx.fillStyle = PageAttack.colors.text;
			ctx.font = View.font;
			ctx.textAlign = 'left';
			ctx.textBaseline = 'alphabetic';
			let typeLine = 'attack type: ' + PageAttack.attackType;
			ctx.fillText(typeLine, cursor.x, cursor.y);
			cursor.movey(lineHeight);
			let atkLine = 'attacker: '+ attacker.name + ' (' + attacker.attack + ')';
			atkLine += ' (' + attacker.alignments + ')';
			ctx.fillText(atkLine, cursor.x, cursor.y);
			cursor.movey(lineHeight);
			let defLine = 'defender: '+ defender.name + ' (' + PageAttack.defenseAttribute + ')';
			defLine += ' (' + defender.alignments + ')';
			ctx.fillText(defLine, cursor.x, cursor.y);

			// totals
			cursor.movey(lineHeight*2);
			let cursor2 = cursor.clone();
			ctx.fillText('total attack: '+PageAttack.attackTotal, cursor.x, cursor.y);
			cursor.movey(lineHeight);
			ctx.fillText('total defense: '+PageAttack.defenseTotal, cursor.x, cursor.y);
			cursor.movey(lineHeight);
			ctx.fillText('roll needed: '+ (PageAttack.attackTotal - PageAttack.defenseTotal) + ' or less', cursor.x, cursor.y);

			// show bonuses
			cursor2.movex(120);
			ctx.fillText('alignment bonus: ' + PageAttack.alignmentBonus, cursor2.x, cursor2.y);
			cursor2.movey(lineHeight);
			ctx.fillText('illuminati defense: ' + 0, cursor2.x, cursor2.y); // TODO

			// results
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

			// cash
			cursor.set(View.canvas.width - Button.size.x*2 - 15, 150);
			ctx.fillText('leverage cash to improve odds', cursor.x, cursor.y);
			cursor.movey(lineHeight);
			ctx.fillText('attacker cash: '+attacker.cash+'MB',cursor.x,cursor.y);
			cursor.movey(lineHeight);
			ctx.fillText('leveraged: '+PageAttack.attackerCash+'MB',cursor.x,cursor.y);
			cursor.movey(lineHeight/2);
			Button.getButton(PageAttack.buttons,'own_cash_more').sety(cursor.y);
			Button.getButton(PageAttack.buttons,'own_cash_less').sety(cursor.y);
			let root_cash_more = Button.getButton(PageAttack.buttons,'root_cash_more');
			let root_cash_less = Button.getButton(PageAttack.buttons,'root_cash_less');
			if (attacker.cardType === Model.CardType.root) {
				root_cash_more.visible = false;
				root_cash_less.visible = false;
			}
			else {
				root_cash_more.visible = true;
				root_cash_less.visible = true;
				let root = attacker.getRoot();
				cursor.movey(lineHeight*2);
				ctx.fillText('root cash: '+root.cash+'MB',cursor.x,cursor.y);
				cursor.movey(lineHeight);
				ctx.fillText('leveraged: '+PageAttack.rootCash+'MB',cursor.x,cursor.y);
				cursor.movey(lineHeight/2);
				root_cash_more.sety(cursor.y);
				root_cash_less.sety(cursor.y);
			}

			// execute and cancel
			cursor.movey(lineHeight*2);
			Button.getButton(PageAttack.buttons,'execute').sety(cursor.y);
			Button.getButton(PageAttack.buttons,'cancel').sety(cursor.y);

			// buttons
			for (let btn of PageAttack.buttons) {
				btn.draw(ctx, btn === PageAttack.hoveredButton);
			}
		}

		// accessors
		public static get alignmentBonus() {
			let attacker = PageAttack.callback({command:'getAttacker'});
			let defender = PageAttack.callback({command:'getDefender'});
			let comparison = Model.Alignment.compare(attacker.alignments, defender.alignments);
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
			return alignBonus;
		}
		public static get attackTotal() {
			let attacker = PageAttack.callback({command:'getAttacker'});
			return attacker.attack + PageAttack.alignmentBonus + PageAttack.attackerCash + PageAttack.rootCash;
		}
		public static get defenseAttribute() {
			let defender = PageAttack.callback({command:'getDefender'});
			let defenseAttribute = defender.defense;
			if(PageAttack.attackType === 'destroy') {
				defenseAttribute = defender.attack;
			}
			return defenseAttribute;
		}
		public static get defenseTotal() {
			let defender = PageAttack.callback({command:'getDefender'});
			return PageAttack.defenseAttribute + defender.getRootProtection();
		}

		// button events
		public static btnAtkType(button: View.Button) {
			for (let btn of button.data.group) {
				btn.selected = false;
			}
			button.selected = true;
			PageAttack.attackType = button.caption;
			View.drawPage();
		}
		public static btnExecuteAttack(button: Button) {
			// make the roll
			PageAttack.roll = Util.randomInt(1,6) + Util.randomInt(1,6);

			// determine success
			let needed = PageAttack.attackTotal - PageAttack.defenseTotal;
			if(needed > 10) { needed = 10; }
			if(PageAttack.roll <= needed) {
				PageAttack.state = AttackState.success;
			}
			else {
				PageAttack.state = AttackState.failure;
			}

			// spend cash used in attack
			let attacker = PageAttack.callback({command:'getAttacker'});
			attacker.cash -= PageAttack.attackerCash;
			let root = attacker.getRoot();
			root.cash -= PageAttack.rootCash;
			
			PageAttack.initDoneState();
			View.drawPage();
		}
		public static btnCancelAttack(button: Button) {
			PageAttack.callback({command:'cancelAttack'});
			View.screenState = State.table;
			PageAttack.reset();
			View.drawPage();
		}
		public static btnDone(button: Button) {

			console.log('btnDone');
			console.log('attack type',PageAttack.attackType);
			console.log('PageAttack.state',AttackState[PageAttack.state]);

			PageAttack.callback({command:'attackerDone'});
			View.screenState = State.table;
			if (PageAttack.state === AttackState.failure) {
				PageAttack.callback({command:'cancelAttack'});
			}
			else if (PageAttack.attackType === 'control') {
				console.log('btnDone calling controlSuccess because attack state is',AttackState[PageAttack.state]);
				PageAttack.callback({command:'controlSuccess'});
			}
			else if (PageAttack.attackType === 'neutralize') {
				PageAttack.callback({command:'neutralizeSuccess'});
			}
			else if (PageAttack.attackType === 'destroy') {
				PageAttack.callback({command:'destroySuccess'});
			}
			PageAttack.reset();
			View.drawPage();
		}
		public static btnOwnCashMore(btn: Button) {
			let attacker = PageAttack.callback({command:'getAttacker'});
			if (PageAttack.attackerCash < attacker.cash) {
				++PageAttack.attackerCash;
			}
			View.drawPage();
		}
		public static btnOwnCashLess(btn: Button) {
			if (PageAttack.attackerCash > 0) {
				--PageAttack.attackerCash;
			}
			View.drawPage();
		}
		public static btnRootCashMore(btn: Button) {
			let attacker = PageAttack.callback({command:'getAttacker'});
			let root = attacker.getRoot();
			if (PageAttack.rootCash < root.cash) {
				++PageAttack.rootCash;
			}
			View.drawPage();
		}
		public static btnRootCashLess(btn: Button) {
			if (PageAttack.rootCash > 0) {
				--PageAttack.rootCash;
			}
			View.drawPage();
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
	export class PageDetail {
		public static buttons: Button[] = [];
		public static hoveredButton: Button;
		public static callback: (any) => any;
		public static card: Model.Card;
		public static colors = {
			text: 'gray',
		};

		public static init(callback: (any) => any) {
			PageDetail.callback = callback;
			PageDetail.buttons = [
				new Button('move', PageDetail.btnMoveGroup, new Util.Point(20, 100), 'move'),
				new Button('attack', PageDetail.btnAttack, new Util.Point(25+Button.size.x,100), 'attack'),
			];
		}
		public static draw(ctx: CanvasRenderingContext2D) {
			let gutter = 20;
			let lineHeight = 16;
			let cursor = new Util.Point(gutter, gutter);
			let card = PageDetail.card;

			// name
			ctx.font = View.boldFont;
			ctx.fillStyle = PageDetail.colors.text;
			ctx.textAlign = 'left';
			ctx.textBaseline = 'alphabetic';
			let cardName = card.name;
			if (card.cardType === Model.CardType.root) {
				cardName = 'The ' + card.name;
			}
			ctx.fillText(cardName, cursor.x, cursor.y);

			// alignments
			if (card.alignments && card.alignments.length > 0) {
				cursor.movey(lineHeight);
				ctx.fillText('(' + card.alignments + ')', cursor.x, cursor.y);
			}
			
			// numbers
			cursor.movey(lineHeight);
			ctx.font = View.font;
			let atk = '' + card.attack;
			if(card.aid > 0) { atk += '/' + card.aid; }
			let def = card.defense;
			ctx.fillText('attack: ' + atk + '  defense: ' + def, cursor.x, cursor.y);
			cursor.movey(lineHeight);
			ctx.fillText('income: '+card.income, cursor.x, cursor.y);
			let protection = card.getRootProtection();
			if (protection > 0) {
				cursor.movey(lineHeight);
				ctx.fillText('protection from illuminati: '+protection, cursor.x, cursor.y);
			}
			
			// specials
			if(card.specials.length > 0){
				cursor.movey(lineHeight);
				ctx.fillText('specials: ' + card.specials.join(', '), cursor.x, cursor.y);
			}
			
			// description
			let description = card.description.split('. ');
			for (let line of description) {
				cursor.movey(lineHeight);
				ctx.fillText(line + '.', cursor.x, cursor.y);
			}
			
			// children
			cursor.movey(lineHeight*2);
			ctx.fillText('children:', cursor.x, cursor.y);
			if (card.children.length === 0) {
				cursor.movey(lineHeight);
				ctx.fillText('none', cursor.x+10, cursor.y);
			}
			else {
				for (let child of card.children) {
					cursor.movey(lineHeight);
					ctx.fillText(child.name, cursor.x+10, cursor.y);
				}
			}

			// buttons
			cursor.movey(lineHeight*2);
			Button.getButton(PageDetail.buttons, 'move').sety(cursor.y);
			Button.getButton(PageDetail.buttons, 'attack').sety(cursor.y);
			for (let btn of PageDetail.buttons) {
				if(btn.caption==='attack' && Control.Turn.actionsTaken >= 2){ continue; }
				if(btn.caption==='move' && card.cardType === Model.CardType.root) { continue; }
				btn.draw(ctx, btn === PageDetail.hoveredButton);
			}
		}

		public static onMouseMove(mouse: Util.Point) {
			let buttonSet = PageDetail.buttons.filter((btn) => btn.visible===true);
			PageDetail.hoveredButton = Button.getHoveredButton(buttonSet, mouse);
			View.drawPage();
		}
		public static onMouseClick(mouse: Util.Point) {
			if (PageDetail.hoveredButton) {
				PageDetail.hoveredButton.callback(PageDetail.hoveredButton);
			}
			else {
				View.screenState = State.table;
				View.drawPage();
			}
		}
	
		public static btnMoveGroup(btn: Button) {
			PageDetail.callback({command:'btnMoveGroup'})(btn);
		}
		public static btnAttack(btn: Button) {
			PageDetail.callback({command:'btnAttack'})(btn);
		}
	}
	export class PageTable {
		public static state: TableState;
		public static mouse: Util.Point;
		public static linkTargets: Model.LinkTarget[];
		public static hoveredLink: Model.LinkTarget = null;
		private static callback: (any) => any;
		public static buttons: Button[] = [];
		static factionButtons: Button[] = [];
		// TODO: handle own input events -- faction view buttons
		public static colors = {
			headerFill: '#eee',
		};

		public static init(callback: (any) => any) {
			PageTable.callback = callback;
			PageTable.state = TableState.normal;
			let cursor = new Util.Point(
				View.canvas.width - Button.size.x,
				View.canvas.height-PageTable.footerHeight
			);
			cursor.move(-10,10);
			PageTable.buttons.push(new Button(
				'end turn',
				PageTable.callback({command:'btnEndTurn'}),
				cursor
			));
			// faction selection buttons
			cursor.set(10,View.canvas.height-15);
			for (let i=Model.Model.factions.length-1; i>=0; --i) {
				let faction = Model.Model.factions[i];
				let btn = new Button(faction.root.name, View.callback('btnShowFaction'), cursor.clone());
				btn.data = faction;
				btn.outline = false;
				btn.textAlign = 'left';
				btn.data = faction;
				PageTable.factionButtons.push(btn);
				cursor.movey(-14);
			}
		}

		public static get footerHeight () { return View.cardLength * 1.4; }

		public static draw(ctx: CanvasRenderingContext2D) {

			// structure
			let faction = View.turnObject.factionShown;
			CardView.orient(faction.root, faction.root.shape.rootPoint.plus(View.focus), 0);
			CardView.draw(ctx, faction.root);

			// header: uncontrolled
			ctx.fillStyle = PageTable.colors.headerFill;
			ctx.fillRect(0,0, View.canvas.width, View.cardLength * 1.4);
			let open = Model.Deck.openCards;
			let cursor = new Util.Point(View.cardLength/2, 10);
			for (let card of open) {
				CardView.orient(card, cursor, 1);
				CardView.draw(ctx, card);
				cursor.movex(View.cardLength);
			}

			// footer: faction selection, hand, buttons
			let height = PageTable.footerHeight;
			ctx.fillStyle = PageTable.colors.headerFill;
			ctx.fillRect(0,View.canvas.height-height, View.canvas.width, height);
			for (let btn of PageTable.factionButtons) {
				if (btn.data === View.turnObject.faction) { btn.font = View.boldFont; }
				else { btn.font = View.font; }
				btn.draw(ctx, btn === View.hoveredButton);
			}
			for (let btn of PageTable.buttons) {
				btn.draw(ctx, btn === View.hoveredButton);
			}

			// DEBUG: draw page state above footer
			cursor.set(10,View.canvas.height - height - 10);
			ctx.font = View.font;
			ctx.textAlign = 'left';
			let message = 'table state: '+TableState[PageTable.state];
			ctx.fillText(message,cursor.x,cursor.y);

			// hovered
			if (PageTable.state === TableState.chooseLink){
				if (PageTable.mouse) {
					let height = View.cardLength;
					let width = View.cardLength * View.widthRatio;
					let rect = new Util.Rectangle(PageTable.mouse.x - width/2, PageTable.mouse.y - height/2, width, height);
					CardView.drawRoundRect(rect, View.getArcSize());
					ctx.strokeStyle = '#aaa';
					ctx.stroke();
				}
			}
			else if (View.hoveredCard){
				CardView.drawHovered(View.hoveredCard,ctx);
			}

		}
		
		public static drawLinkChoice(closest){
			View.drawPage();
			if (!closest) { return; }
			View.beginPath();
			View.context.arc(closest.point.x, closest.point.y, View.getArcSize(), 0, 2*Math.PI, false);
			View.context.strokeStyle = 'red';
			View.context.stroke();
		}

		public static onMouseMove(mouse: Util.Point) {
			PageTable.mouse = mouse;
			if(PageTable.state === TableState.chooseLink) {
				let closest = null;
				let sqDist = 0;
				let minDist = Math.pow(View.cardLength, 2);
				for (let target of this.linkTargets) {
					let d2 = mouse.distSquared(target.point);
					if (d2 > minDist) { continue; }
					if (closest===null || d2 < sqDist){
						closest = target;
						sqDist = d2;
					}
				}
				this.hoveredLink = closest;
				PageTable.drawLinkChoice(closest);
			}
			else {
				let dirty = false;

				let cardSet: Model.Card[];
				if (PageTable.callback({command:'commandIsAttack'})) {
					cardSet = Model.Deck.attackTargets;
				}
				else {
					cardSet = Model.Deck.tableCards;
				}

				let hovered = Model.Model.getHoveredCard(mouse, cardSet);
				if(hovered !== View.hoveredCard){
					View.hoveredCard = hovered;
					dirty = true;
				}
				let btn = View.getHoveredButton(PageTable.factionButtons.concat(PageTable.buttons), mouse);
				if (btn !== View.hoveredButton) {
					View.hoveredButton = btn;
					dirty = true;
				}
				if (dirty) { View.drawPage(); }
			}
		}
		public static onMouseClick(mouse: Util.Point) {
			if (PageTable.state === TableState.chooseLink) {
				// TODO: check for card overlap
				if (PageTable.hoveredLink) { // place the card
					let defender = PageAttack.callback({command:'getDefender'});
					defender.decouple();
					PageTable.hoveredLink.card.addCard(defender, PageTable.hoveredLink.linkIndex);
					PageTable.callback({command:'clearCommand'});
					PageTable.state = TableState.normal;
					View.canvas.style.cursor = 'arrow';
					View.drawPage();
				}
			}

			else if (View.hoveredButton) {
				View.hoveredButton.callback(View.hoveredButton);
			}

			else if (View.hoveredCard){
				if (PageTable.callback({command:'commandIsAttack'})) {
					View.canvas.style.cursor = '';
					PageTable.callback({command:'setDefender', value:View.hoveredCard});
					View.screenState = State.attackSetup;
					PageAttack.reset();
					View.drawPage();
				}
				else {
					View.screenState = State.detail;
					PageDetail.card = View.hoveredCard;
					View.drawPage();
				}
			}

		}
	}
}
