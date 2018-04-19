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
	}

	export class View {
		static screenState: State;
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
			View.detailButtons = [
				new Button('move', View.callback('btnMoveGroup'), new Util.Point(20, 100)),
				new Button('attack', View.callback('btnAttack'), new Util.Point(100,100)),
			];
			// faction selection buttons
			View.factionButtons = [];
			let cursor = new Util.Point(10,View.canvas.height-10);
			for (let i=Model.Model.factions.length-1; i>=0; --i) {
				let faction = Model.Model.factions[i];
				let btn = new Button(faction.root.name, View.callback('btnShowFaction'), cursor.clone());
				btn.data = faction;
				btn.outline = false;
				btn.textPoint = cursor.clone();
				btn.textAlign = 'left';
				btn.data = faction;
				View.factionButtons.push(btn);
				cursor.movey(-14);
			}
			this.orientRootCards(Model.Model.factions);

			this.drawPage();
		}
		public static dragFocus(delta: Util.Point) {
			View.focus.move(delta.x, delta.y);
		}
		
		// public static draw(){
		// 	this.clear();

		// 	// structure
		// 	let faction = View.turnObject.factionShown;
		// 	CardView.orient(faction.root, faction.root.shape.rootPoint.plus(View.focus), 0);
		// 	// View.drawCard(faction.root);
		// 	CardView.draw(View.context, faction.root);

		// 	// header: uncontrolled
		// 	View.context.fillStyle = View.colors.screen.headerFill;
		// 	View.context.fillRect(0,0, View.canvas.width, View.cardLength * 1.4);
		// 	let open = Model.Deck.openCards;
		// 	let cursor = new Util.Point(View.cardLength/2, 10);
		// 	for (let card of open) {
		// 		CardView.orient(card, cursor, 1);
		// 		CardView.draw(View.context, card);
		// 		cursor.movex(View.cardLength);
		// 	}

		// 	// footer: faction selection, hand, buttons
		// 	let height = View.cardLength * 1.4;
		// 	View.context.fillStyle = View.colors.screen.headerFill;
		// 	View.context.fillRect(0,View.canvas.height-height, View.canvas.width, height);
		// 	for (let btn of View.factionButtons) {
		// 		if (btn.data === View.turnObject.faction) { btn.font = View.boldFont; }
		// 		else { btn.font = View.font; }
		// 		btn.draw(View.context, btn === View.hoveredButton);
		// 	}

		// 	// hovered
		// 	if(View.hoveredCard){
		// 		CardView.drawHovered(View.hoveredCard,View.context);
		// 	}

		// }

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
			View.context.fillStyle = CardView.colors.card.text; // TODO: make page object and keep own colors
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
					if (card.faction !== View.turnObject.faction) { continue; }
					// TODO: allow for groups that can act twice
					if (View.turnObject.getHasActed(card)) { continue; }
				}
				btn.moveTo(cursor);
				let hovered = (mouse && btn.rect.contains(mouse));
				if (hovered) { View.hoveredButton = btn; }

				CardView.drawRoundRect(btn.rect, 10);
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

		public static drawPage(){
			View.clear();
			if (View.screenState === State.attackSetup) { PageAttack.draw(View.context); }
			else if (View.screenState === State.table) { PageTable.draw(View.context); }
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
				case State.attackSetup: PageAttack.onMouseMove(mouse);
				case State.table: PageTable.onMouseMove(mouse);
			}
		}
		public static onMouseClick(mouse: Util.Point) {
			switch (this.screenState) {
				case State.attackSetup: PageAttack.onMouseClick(mouse);
				case State.table: PageTable.onMouseClick(mouse);
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
		// TODO: store own colors
		public static state: AttackState;
		public static buttons: Button[] = [];
		public static hoveredButton: Button = null;
		public static attackType = 'control';
		public static roll = 0;
		public static callback: (data:any) => any;

		public static init(atkCallback: (data:any) => any) {
			PageAttack.callback = atkCallback;

			this.reset();
			let lineHeight = 22;
			let cursor = new Util.Point(10,150);
			this.buttons.push( new Button('execute', PageAttack.btnExecuteAttack, cursor) );
			cursor.movey(lineHeight);
			this.buttons.push( new Button('cancel', PageAttack.btnCancelAttack, cursor) );
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
		public static draw (ctx: CanvasRenderingContext2D) {
			let leftMargin = 10;
			let lineHeight = 15;
			let attacker = PageAttack.callback({command:'getAttacker'});
			let defender = PageAttack.callback({command:'getDefender'});
			let defenseAttribute = defender.defense;
			if(PageAttack.attackType === 'destroy') {
				defenseAttribute = defender.attack;
			}

			// TODO: compute target proximity to root card
			// TODO: allow use of cash
			// TODO: disallow control attacks if attacker has no open out links
			// TODO: figure in card special abilities
			// TODO: newly-controlled cards get their cash halved

			let cursor = new Util.Point(leftMargin,lineHeight);
			ctx.fillStyle = CardView.colors.card.text;
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
			let defLine = 'defender: '+ defender.name + ' (' + defenseAttribute + ')';
			defLine += ' (' + defender.alignments + ')';
			ctx.fillText(defLine, cursor.x, cursor.y);

			// compute totals
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
			let totalAtk = attacker.attack + alignBonus;
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

		// accessors
		public static get attackTotal() { return PageAttack.callback({command:'getAttacker'}).attack; }
		public static get defenseTotal() { return PageAttack.callback({command:'getDefender'}).defense; }

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
			// TODO: spend cash used in attack
			PageAttack.callback({command:'attackerDone'});
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
			PageAttack.callback({command:'cancelAttack'});
			View.screenState = State.table;
			PageAttack.reset();
			View.drawPage();
		}
		public static btnDone(button: Button) {
			View.screenState = State.table;
			if (PageAttack.state === AttackState.failure) {
				PageAttack.callback({command:'cancelAttack'});
			}
			else if (PageAttack.attackType === 'control') {
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
	export class PageTable {
		public static state: TableState;
		public static linkTargets: Model.LinkTarget[];
		public static hoveredLink: Model.LinkTarget = null;
		private static callback: (any) => any;
		// TODO: handle own input events
		public static colors = {
			headerFill: '#eee',
		};

		public static init(callback: (any) => any) {
			PageTable.callback = callback;
			PageTable.state = TableState.normal;
		}

		public static draw(ctx: CanvasRenderingContext2D) {

			// structure
			let faction = View.turnObject.factionShown;
			CardView.orient(faction.root, faction.root.shape.rootPoint.plus(View.focus), 0);
			// View.drawCard(faction.root);
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
			let height = View.cardLength * 1.4;
			ctx.fillStyle = PageTable.colors.headerFill;
			ctx.fillRect(0,View.canvas.height-height, View.canvas.width, height);
			for (let btn of View.factionButtons) {
				if (btn.data === View.turnObject.faction) { btn.font = View.boldFont; }
				else { btn.font = View.font; }
				btn.draw(ctx, btn === View.hoveredButton);
			}

			// hovered
			if (PageTable.state === TableState.chooseLink){

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
				let hovered = Model.Model.getHoveredCard(mouse, Model.Deck.tableCards);
				if(hovered !== View.hoveredCard){
					View.hoveredCard = hovered;
					dirty = true;
				}
				let btn = View.getHoveredButton(View.factionButtons, mouse);
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
					View.drawDetail(View.hoveredCard, mouse);
				}
			}

		}
	}
}
