namespace Model {
	export enum CardLocation {deck,hand,open,structure,discard};
	export enum CardType {root,group,special};
	export enum Align {government,communist,liberal,conservative,peaceful,violent,straight,weird,criminal,fanatic};

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
		specials = [];

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
		getRoot(): Card {
			let cursor: Card = this;
			while (cursor.cardType !== CardType.root) {
				cursor = cursor.parent;
			}
			return cursor;
		}
		getRootProtection(): number {
			let cursor: Card = this;
			if(!cursor.parent) { return 0; }
			if(cursor.cardType === CardType.root) { return 0; }
			cursor = cursor.parent;
			if(cursor.cardType === CardType.root) { return 10; }
			cursor = cursor.parent;
			if(cursor.cardType === CardType.root) { return 5; }
			cursor = cursor.parent;
			if(cursor.cardType === CardType.root) { return 2; }
			return 0;
		}
		getOpenLinks(): LinkTarget[] {
			let targets: LinkTarget[] = [];
			for (let index = 0; index < this.links.length; ++index){
				if (this.links[index] !== 1) { continue; }
				targets.push(new LinkTarget(this.shape.links[index], this, index));
			}
			return targets;
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
				if(income[0] === '*'){
					card.income = 0;
					card.specials.push(income.substr(1,income.length-1));
				}
				else {
					card.income = parseInt(income);
				}
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
				'group|American Autoduel Association||1|5|1|1|Violent,Weird',
				'group|Anti-Nuclear Activists|+2 on any attempt to destroy Nuclear Power Companies|2|5|1|1|Liberal',
				'group|Big Media||4/3|6|3|3|Straight,Liberal',
				'group|C.I.A.||6/4|5|3|0|Government,Violent',
				'group|California||5|4|2|5|Weird,Liberal,Government',
				'group|Comic Books||1|1|1|2|Weird,Violent',
				'group|Cycle Gangs|+2 on any attempt to destroy any group|0|4|0|0|Violent,Weird',
				'group|Democrats||5|4|2|3|Liberal',
				'group|Eco-Guerrillas||0|6|0|1|Liberal,Violent,Weird',
				'group|F.B.I.||4/2|6|2|0|Government,Straight',
				'group|Fnord Motor Company||2|4|1|2|Peaceful',
				'group|Health Food Stores|+2 on any attempt to control Anti-Nuclear Activists|1|3|1|2|Liberal',
				'group|Hollywood||2|0|2|5|Liberal',
				'group|I.R.S.|Owning player may tax each opponent 2MB on his own income phase. Tax may come from any group. If a player has no money, he owes no tax.|5/3|5|2|*irs tax|Criminal,Government',
				'group|International Cocaine Smugglers|+4 on any attempt to control Punk Rockers, Cycle Gangs or Hollywood|3|5|3|5|Criminal',
				'group|Junk Mail|+4 on any attempt to control the Post Office|1|3|1|2|Criminal',
				'group|KGB||2/2|6|1|0|Communist,Violent',
				'group|Loan Sharks||5|5|1|6|Criminal,Violent',
				'group|Local Police Departments||0|4|0|1|Conservative,Straight,Violent',
				'group|Mafia||7|7|3|6|Criminal,Violent',
				'group|Moral Minority||2|1|1|2|Conservative,Straight,Fanatic',
				'group|Multinational Oil Companies||6|4|2|8|',
				'group|New York||7|8|3|3|Violent,Criminal,Government',
				'group|Phone Company||5/2|6|2|3|',
				'group|Phone Phreaks|+3 on any attempt to control, neutralize or destroy Phone Company|0/1|1|0|1|Criminal,Liberal',
				'group|Professional Sports||2|4|2|3|Violent,Fanatic',
				'group|Republicans||4|4|3|4|Conservative',
				'group|Semiconscious Liberation Army|+1 on any attempt to destroy any group|0|8|0|0|Criminal,Violent,Liberation,Weird,Communist',
				'group|Tabloids|+3 for direct control of Convenience Stores.|2|3|1|3|Weird',
				'group|Texas||6|6|2|4|Violent,Conservative,Government',
				'group|Trekkies||0|4|0|3|Weird,Fanatic',
				'group|TV Preachers|+3 for direct control of the Moral Minority|3|6|2|4|Straight,Fanatic',
				'group|Yuppies||1/1|4|1|5|Conservative',
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

		static get attackTargets () {
			return Deck.tableCards.filter((card) => card.cardType !== CardType.root);
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

	export class LinkTarget {
		constructor(public point: Util.Point, public card: Card, public linkIndex: number){}
	}

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
			let faction = movingCard.faction;
			let targets = [];
			for (let card of cardSet) {
				if (card.faction !== faction) { continue; }
				if (card === movingCard){ continue; }
				if (card.isDescendantOf(movingCard)) { continue; }
				targets = targets.concat(card.getOpenLinks());
			}
			return targets;
		}

		static initFactions(quantity: number) {
			for (let i = 0; i < quantity; ++i) {
				Model.factions.push(new Faction());
			}
		}
	}

}
