
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
			
			
			View.View.init(Control.viewCallback, Turn);
			View.PageAttack.init(Attack, Control.attackCallback);

			this.mouse = {
				down: false,
				drag: false,
				last: null,
			};
		}

		public static viewCallback(command): any {
			switch (command) {
				case 'btnMoveGroup': return Control.btnMoveGroup;
				case 'btnAttack': return Control.btnAttack;
				case 'btnShowFaction': return Control.btnShowFaction;
			}
		}
		public static attackCallback(data): void {
			if (data.command === 'attackerDone') { Turn.setHasActed(Attack.attacker); }
			else if (data.command === 'cancelAttack') { Control.cancelAttack(); }
			else if (data.command === 'controlSuccess') { Control.controlSuccess(); }
			else if (data.command === 'neutralizeSuccess') { Control.neutralizeSuccess(); }
			else if (data.command === 'destroySuccess') { Control.destroySuccess(); }
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
