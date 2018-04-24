// TODO: show somehow that the "hovered" card is getting moved (gray out or attach to mouse)
// TODO: if the card is a special, put it in the player's "hand"
// TODO: disabled buttons should look disabled
// TODO: on attack page, if no attack type is selected then execute should be disabled

namespace Control {
	export enum Command {attack, cashXfer, none, placeCard};

	export class Control {
		public static linkTargets: Model.LinkTarget[];
		public static hoveredCard: Model.Card = null;
		public static hoveredLink: Model.LinkTarget = null;
		public static mouse: any;
		public static command: Command = null;
		public static attacker: Model.Card = null;
		public static defender: Model.Card = null;
		public static movingCard: Model.Card = null;

		public static init(){
			Model.Deck.init();
			Model.Model.initFactions(2);
			Model.Alignment.init();
			Turn.initTurn(0);
			
			for (let i=0; i<4; ++i) {
				let card = Model.Deck.drawGroup().cardLocation = Model.CardLocation.open;
			}
			
			View.View.init(Control.viewCallback, Turn);
			View.PageAttack.init(Control.attackCallback);
			View.PageTable.init(Control.tableCallback);
			View.PageDetail.init(Control.detailCallback);
			View.View.drawPage();

			this.mouse = {
				down: false,
				drag: false,
				last: null,
			};
		}

		public get commandString(): string {
			return Command[Control.command];
		}
		public static viewCallback(command): any {
			switch (command) {
				case 'btnMoveGroup': return Control.btnMoveGroup;
				case 'btnAttack': return Control.btnAttack;
			}
		}
		public static attackCallback(data): any {
			switch(data.command) {
				case 'attackerDone': Turn.setHasActed(Attack.attacker); break;
				case 'cancelAttack': Control.cancelAttack(); break;
				case 'controlSuccess': Control.controlSuccess(); break;
				case 'neutralizeSuccess': Control.neutralizeSuccess(); break;
				case 'destroySuccess': Control.destroySuccess(); break;
				case 'getDefender': return Attack.defender;
				case 'getAttacker': return Attack.attacker;
			}
		}
		public static tableCallback(data): any {
			switch(data.command) {
				case 'commandIsAttack': return Control.command == Command.attack;
				case 'setDefender': Attack.setDefender(data.value); break;
				case 'clearCommand': Control.command = Command.none; break;
				case 'btnEndTurn': return Control.btnEndTurn;
				case 'btnShowFaction': return Control.btnShowFaction;
				case 'cashXferTarget': Control.beginCashXfer(); break;
				case 'cashXferFinish': return Control.cashXferFinish(data.value);
			}
		}
		public static detailCallback(data): any {
			switch (data.command) {
				case 'btnMoveGroup': return Control.btnMoveGroup;
				case 'btnAttack': return Control.btnAttack;
				case 'btnCashXfer': return Control.btnCashXfer;
			}
		}

		public static beginCashXfer(): void {
			Attack.setDefender(View.View.hoveredCard);
			View.PageTable.openCashXferDialog();
			View.View.canvas.style.cursor = '';
			View.View.drawPage();
		}
		public static cashXferFinish(dialog): void {
			if (dialog.ok) {
				let values = dialog.data;
				Attack.attacker.cash = values.cashXfer.leftValue;
				Attack.defender.cash = values.cashXfer.rightValue;
			}
			Control.command = Command.none;
			View.View.drawPage();
		}
		public static beginChooseLink(cardToPlace: Model.Card, cardSet: Model.Card[] = Model.Deck.structureCards){
			View.View.screenState = View.State.table;
			View.PageTable.state = View.TableState.chooseLink;
			View.PageTable.linkTargets = Model.Model.getLinkTargets(cardToPlace, cardSet);
			View.View.drawPage();
		}
		public static beginChooseTarget(){
			View.View.screenState = View.State.table;
			View.View.canvas.style.cursor = 'crosshair';
			if (Control.command === Command.cashXfer) {
				View.PageTable.cardTargets = Model.Deck.getAdjacentCards(Attack.attacker);
			}
			View.View.drawPage();
		}
		public static cancelAttack() {
			// Attack.clear();
			this.command = Command.none;
		}
		public static restoreTableState() {
			View.View.screenState = View.State.table;
			Turn.factionShownIndex = Turn.factionIndex;
			View.View.drawPage();
		}
		public static controlSuccess() {
			Control.command = Command.none;
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
			if (Control.mouse.down && !mouse.equals(Control.mouse.last)) {
				Control.mouse.drag = true;
			}
			if(Control.mouse.drag && View.View.screenState === View.State.table){
				let delta = mouse.minus(Control.mouse.last);
				View.View.dragFocus(delta);
				View.View.drawPage();
			}
			View.View.onMouseMove(mouse);
			this.mouse.last = mouse;
		}
		public static onMouseOut(event: MouseEvent){
			this.mouse.down = false;
			this.mouse.drag = false;
		}
		public static onMouseUp(event: MouseEvent){
			Control.mouse.drag = false;
			let mouse = new Util.Point(event.offsetX, event.offsetY);
			
			if(this.mouse.drag){}
			else { View.View.onMouseClick(mouse); }

			this.mouse.down = false;
			this.mouse.drag = false;
		}
	
		public static btnAttack(button: View.Button) {
			Attack.setAttacker(View.View.hoveredCard);
			Control.command = Command.attack;
			Control.beginChooseTarget();
		}
		public static btnCashXfer(button: View.Button) {
			Attack.setAttacker(View.View.hoveredCard);
			Control.command = Command.cashXfer;
			Control.beginChooseTarget();
		}
		public static btnMoveGroup(button: View.Button) {
			console.log('btnMoveGroup');
		}
		public static btnShowFaction(button: View.Button) {
			Turn.factionShownIndex = Model.Model.factions.indexOf(button.data);
			View.View.drawPage();
		}
		public static btnEndTurn(button: View.Button) {
			Turn.nextTurn();
			View.View.drawPage();
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
		public static get attacker(){
			return Attack._attacker;
		}
		public static get defender(){
			return Attack._defender;
		}
	}

	export class Turn {
		static factionIndex: number;
		static factionShownIndex: number;
		static hasActed: Model.Card[];
		static hasActedTwice: Model.Card[];
		static actionsTaken = 0;

		static initTurn(factionIndex: number): void {
			Turn.factionIndex = factionIndex;
			Turn.factionShownIndex = factionIndex;
			Turn.hasActed = [];
			Turn.hasActedTwice = [];
			Turn.actionsTaken = 0;
			Turn.faction.collectIncome();
		}
		static nextTurn(): void {
			Turn.initTurn(
				(Turn.factionIndex+1) % Model.Model.factions.length
			);
			// should be at least 2 open cards
			while (Model.Deck.openCards.length < 2) {
				let card = Model.Deck.drawGroup();
				if (card) {
					card.cardLocation = Model.CardLocation.open;
				}
				else { break; }
			}
			// then draw a card
			let card = Model.Deck.drawPlot();
			if(card) { card.cardLocation = Model.CardLocation.open; }
		}

		static getHasActed(group: Model.Card): boolean {
			return Turn.hasActed.indexOf(group) > -1;
		}

		static getHasActedTwice(group: Model.Card): boolean {
			return Turn.hasActedTwice.indexOf(group) > -1;
		}

		static setHasActed(group: Model.Card): void {
			Turn.hasActed.push(group);
			Turn.actionsTaken++;
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
