var Util;
(function (Util) {
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    Util.randomInt = randomInt;
    class Point {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        add(p) {
            this.move(p.x, p.y);
        }
        clone() { return new Point(this.x, this.y); }
        copy(p) {
            this.x = p.x;
            this.y = p.y;
        }
        distSquared(p) {
            return Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2);
        }
        dividedBy(n) {
            return new Point(this.x / n, this.y / n);
        }
        times(m) {
            return new Point(this.x * m, this.y * m);
        }
        equals(p) {
            return this.x === p.x && this.y === p.y;
        }
        floor() {
            return new Point(Math.floor(this.x), Math.floor(this.y));
        }
        minus(p) {
            return new Point(this.x - p.x, this.y - p.y);
        }
        move(dx, dy) {
            this.movex(dx);
            this.movey(dy);
        }
        movex(d) { this.x += d; }
        movey(d) { this.y += d; }
        shifted(dx, dy) {
            return new Point(this.x + dx, this.y + dy);
        }
        get negative() {
            return new Point(-this.x, -this.y);
        }
        get normal() {
            return new Point((this.x === 0) ? 0 : this.x / Math.abs(this.x), (this.y === 0) ? 0 : this.y / Math.abs(this.y));
        }
        get switched() {
            return new Point(this.y, this.x);
        }
        plus(p) {
            return new Point(this.x + p.x, this.y + p.y);
        }
        set(x, y) {
            this.x = x;
            this.y = y;
        }
        toString() {
            return '(' + this.x + ', ' + this.y + ')';
        }
    }
    Util.Point = Point;
    class Rectangle {
        constructor(x, y, w, h) {
            this.set(x, y, w, h);
        }
        set(x, y, w, h) {
            this.upperLeft = new Point(x, y);
            this.lowerRight = new Point(x + w, y + h);
        }
        contains(p) {
            if (p.x < this.upperLeft.x) {
                return false;
            }
            if (p.y < this.upperLeft.y) {
                return false;
            }
            if (p.x > this.lowerRight.x) {
                return false;
            }
            if (p.y > this.lowerRight.y) {
                return false;
            }
            return true;
        }
        get center() {
            return new Point(this.upperLeft.x + (this.lowerRight.x - this.upperLeft.x) / 2, this.upperLeft.y + (this.lowerRight.y - this.upperLeft.y) / 2);
        }
        get x() {
            return this.upperLeft.x;
        }
        get y() {
            return this.upperLeft.y;
        }
        get w() {
            return this.lowerRight.x - this.upperLeft.x;
        }
        get h() {
            return this.lowerRight.y - this.upperLeft.y;
        }
    }
    Util.Rectangle = Rectangle;
})(Util || (Util = {}));
var Model;
(function (Model_1) {
    let CardLocation;
    (function (CardLocation) {
        CardLocation[CardLocation["deck"] = 0] = "deck";
        CardLocation[CardLocation["hand"] = 1] = "hand";
        CardLocation[CardLocation["open"] = 2] = "open";
        CardLocation[CardLocation["structure"] = 3] = "structure";
        CardLocation[CardLocation["discard"] = 4] = "discard";
    })(CardLocation = Model_1.CardLocation || (Model_1.CardLocation = {}));
    ;
    let CardType;
    (function (CardType) {
        CardType[CardType["root"] = 0] = "root";
        CardType[CardType["group"] = 1] = "group";
        CardType[CardType["special"] = 2] = "special";
    })(CardType = Model_1.CardType || (Model_1.CardType = {}));
    ;
    let Align;
    (function (Align) {
        Align[Align["government"] = 0] = "government";
        Align[Align["communist"] = 1] = "communist";
        Align[Align["liberal"] = 2] = "liberal";
        Align[Align["conservative"] = 3] = "conservative";
        Align[Align["peaceful"] = 4] = "peaceful";
        Align[Align["violent"] = 5] = "violent";
        Align[Align["straight"] = 6] = "straight";
        Align[Align["weird"] = 7] = "weird";
        Align[Align["criminal"] = 8] = "criminal";
        Align[Align["fanatic"] = 9] = "fanatic";
    })(Align = Model_1.Align || (Model_1.Align = {}));
    ;
    class Alignment {
        static init() {
            Alignment.data[Align.government] = { name: 'Government', opp: Align.communist };
            Alignment.data[Align.communist] = { name: 'Communist', opp: Align.government };
            Alignment.data[Align.liberal] = { name: 'Liberal', opp: Align.conservative };
            Alignment.data[Align.conservative] = { name: 'Conservative', opp: Align.liberal };
            Alignment.data[Align.peaceful] = { name: 'Peaceful', opp: Align.violent };
            Alignment.data[Align.violent] = { name: 'Violent', opp: Align.peaceful };
            Alignment.data[Align.straight] = { name: 'Straight', opp: Align.weird };
            Alignment.data[Align.weird] = { name: 'Weird', opp: Align.straight };
            Alignment.data[Align.criminal] = { name: 'Criminal', opp: null };
            Alignment.data[Align.fanatic] = { name: 'Fanatic', opp: Align.fanatic };
        }
        static getIndex(name) {
            for (let i = 0; i < Alignment.data.length; ++i) {
                if (Alignment.data[i].name.toLowerCase() === name.toLowerCase()) {
                    return i;
                }
            }
        }
        static getName(index) {
            return Alignment.data[index];
        }
        static getOpposite(index) {
            return Alignment.data[index].opp;
        }
        static compare(first, second) {
            let result = { same: 0, opposite: 0 };
            if (!first)
                return result;
            for (let fa of first) {
                for (let sa of second) {
                    let fi = this.getIndex(fa);
                    let si = this.getIndex(sa);
                    if (this.data[fi].opp === si) {
                        result.opposite++;
                    }
                    else if (fi === si) {
                        result.same++;
                    }
                }
            }
            return result;
        }
    }
    Alignment.data = [];
    Model_1.Alignment = Alignment;
    class Faction {
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
        collectIncome() {
            this.root.collectIncome();
        }
    }
    Model_1.Faction = Faction;
    class Card {
        constructor(name, links = 4) {
            this.cash = 0;
            this.specials = [];
            this.name = name;
            this.linkCount = links;
            this.parent = null;
            this.shape = {
                rotation: 0,
                stem: new Util.Point(0, 0),
                rect: new Util.Rectangle(0, 0, 0, 0),
                links: [
                    new Util.Point(0, 0), new Util.Point(0, 0),
                    new Util.Point(0, 0), new Util.Point(0, 0),
                ],
                rootPoint: null,
            };
            this.links = [0, 0, 0, 0];
            if (links === 4) {
                this.links[0] = 1;
            }
            if (links > 1) {
                this.links[1] = 1;
            }
            if (links !== 2 && links !== 0) {
                this.links[2] = 1;
            }
            if (links > 1) {
                this.links[3] = 1;
            }
        }
        static init(text) {
            let fields = text.split("|");
            let [type, name, description, atk, def, links, income, alignments, objective] = text.split("|");
            let card = new Card(name, parseInt(links));
            card.description = description;
            card.cardLocation = CardLocation.deck;
            if (type !== 'special') {
                let [attack, aid] = atk.split("/");
                card.attack = parseInt(attack);
                card.aid = aid ? parseInt(aid) : 0;
                card.defense = parseInt(def);
                if (income[0] === '*') {
                    card.income = 0;
                    card.specials.push(income.substr(1, income.length - 1));
                }
                else {
                    card.income = parseInt(income);
                }
            }
            if (type === 'root') {
                card.objective = objective;
                card.cardType = CardType.root;
            }
            else if (type === 'group') {
                if (alignments.length > 0) {
                    card.alignments = alignments.split(',');
                }
                else {
                    card.alignments = [];
                }
                card.cardType = CardType.group;
            }
            else {
                card.cardType = CardType.special;
            }
            return card;
        }
        get children() {
            let children = [];
            for (let link of this.links) {
                if (typeof link !== 'number') {
                    children.push(link);
                }
            }
            return children;
        }
        addCard(card, link) {
            if (this.links[link] !== 1) {
                return false;
            }
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
            if (!this.parent) {
                return;
            }
            for (let dir in Object.keys(this.parent.links)) {
                if (typeof this.parent.links[dir] !== 'number' && this.parent.links[dir] === this) {
                    this.parent.links[dir] = 1;
                    this.parent = null;
                    return;
                }
            }
            throw new Error('error decoupling child node');
        }
        getChildDirection(child) {
            for (let dir in Object.keys(this.links)) {
                if (typeof this.links[dir] !== 'number' && this.links[dir] === child) {
                    return dir;
                }
            }
            return null;
        }
        isDescendantOf(card) {
            let cursor = this.parent;
            while (cursor) {
                if (cursor === card) {
                    return true;
                }
                cursor = cursor.parent;
            }
            return false;
        }
        getRoot() {
            let cursor = this;
            while (cursor.cardType !== CardType.root) {
                cursor = cursor.parent;
            }
            return cursor;
        }
        getRootProtection() {
            let cursor = this;
            if (!cursor.parent) {
                return 0;
            }
            if (cursor.cardType === CardType.root) {
                return 0;
            }
            cursor = cursor.parent;
            if (cursor.cardType === CardType.root) {
                return 10;
            }
            cursor = cursor.parent;
            if (cursor.cardType === CardType.root) {
                return 5;
            }
            cursor = cursor.parent;
            if (cursor.cardType === CardType.root) {
                return 2;
            }
            return 0;
        }
        get openLinks() {
            let targets = [];
            for (let index = 0; index < this.links.length; ++index) {
                if (this.links[index] !== 1) {
                    continue;
                }
                targets.push(new LinkTarget(this.shape.links[index], this, index));
            }
            return targets;
        }
    }
    Model_1.Card = Card;
    class Deck {
        static init() {
            for (let text of Deck.library) {
                Deck.cards.push(Card.init(text));
            }
        }
        static drawCard(collection, filter) {
            let available = collection.filter((card) => {
                if (card.cardLocation !== CardLocation.deck) {
                    return false;
                }
                return filter(card);
            });
            let draw = available[Util.randomInt(0, available.length - 1)];
            draw.cardLocation = CardLocation.structure;
            return draw;
        }
        static drawRoot() {
            return Deck.drawCard(Deck.cards, (card) => { return card.cardType === CardType.root; });
        }
        static drawPlot() {
            return Deck.drawCard(Deck.cards, (card) => { return card.cardType !== CardType.root; });
        }
        static drawGroup() {
            return Deck.drawCard(Deck.cards, (card) => { return card.cardType === CardType.group; });
        }
        static getAdjacentCards(card) {
            let cards = card.children;
            if (card.parent) {
                cards.push(card.parent);
            }
            return cards;
        }
        static get attackTargets() {
            return Deck.tableCards.filter((card) => card.cardType !== CardType.root);
        }
        static get structureCards() {
            return Deck.cards.filter((card) => {
                return card.cardLocation === CardLocation.structure
                    && card.faction === Control.Turn.factionShown;
            });
        }
        static get tableCards() {
            return Deck.openCards.concat(Deck.structureCards);
        }
        static get openCards() {
            return Deck.cards.filter((card) => { return card.cardLocation === CardLocation.open; });
        }
    }
    Deck.cards = [];
    Deck.library = [
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
    ];
    Model_1.Deck = Deck;
    class LinkTarget {
        constructor(point, card, linkIndex) {
            this.point = point;
            this.card = card;
            this.linkIndex = linkIndex;
        }
    }
    Model_1.LinkTarget = LinkTarget;
    class Model {
        static getHoveredCard(mouse, cardSet = Deck.tableCards) {
            for (let card of cardSet) {
                if (card.shape.rect.contains(mouse)) {
                    return card;
                }
            }
            return null;
        }
        static newCard(faction, name, links) {
            let card = new Card(name, links);
            card.faction = faction;
            return card;
        }
        static getLinkTargets(movingCard, cardSet = Deck.structureCards) {
            let faction = movingCard.faction;
            let targets = [];
            for (let card of cardSet) {
                if (card.faction !== faction) {
                    continue;
                }
                if (card === movingCard) {
                    continue;
                }
                if (card.isDescendantOf(movingCard)) {
                    continue;
                }
                targets = targets.concat(card.openLinks);
            }
            return targets;
        }
        static initFactions(quantity) {
            for (let i = 0; i < quantity; ++i) {
                Model.factions.push(new Faction());
            }
        }
    }
    Model.factions = [];
    Model_1.Model = Model;
})(Model || (Model = {}));
// TODO: disallow control attacks if attacker has no open out links
// TODO: figure in card special abilities
// TODO: newly-controlled cards get their cash halved
// TODO: move faction view buttons from View to PageView
// TODO: create a visual cueue of unplaced cards...
//				the first in line is the target of a successful control attack
//				the next in line are that card's children, then their children, and so on
//				each card keeps track of its parent, so that can be used for valid link targets
//				for each card to be placed, guard against card overlap
var View;
(function (View_1) {
    let State;
    (function (State) {
        State[State["table"] = 0] = "table";
        State[State["detail"] = 1] = "detail";
        State[State["choice"] = 2] = "choice";
        State[State["attackSetup"] = 3] = "attackSetup";
    })(State = View_1.State || (View_1.State = {}));
    ;
    let AttackState;
    (function (AttackState) {
        AttackState[AttackState["setup"] = 0] = "setup";
        AttackState[AttackState["success"] = 1] = "success";
        AttackState[AttackState["failure"] = 2] = "failure";
    })(AttackState = View_1.AttackState || (View_1.AttackState = {}));
    ;
    let TableState;
    (function (TableState) {
        TableState[TableState["normal"] = 0] = "normal";
        TableState[TableState["chooseLink"] = 1] = "chooseLink";
    })(TableState = View_1.TableState || (View_1.TableState = {}));
    ;
    let ElementType;
    (function (ElementType) {
        ElementType[ElementType["input"] = 0] = "input";
        ElementType[ElementType["transfer"] = 1] = "transfer";
    })(ElementType = View_1.ElementType || (View_1.ElementType = {}));
    ;
    class CardView {
        static draw(ctx, card) {
            // border
            CardView.drawBorder(card);
            if (card.cardType === Model.CardType.group) {
                ctx.fillStyle = CardView.colors.card.fill;
            }
            else {
                ctx.fillStyle = CardView.colors.rootCard.fill;
            }
            ctx.strokeStyle = CardView.colors.card.border;
            ctx.fill();
            ctx.stroke();
            // links
            for (let index = 0; index < card.links.length; ++index) {
                let inward = false;
                if (card.links[index] === 0) {
                    if (index === 0) {
                        inward = true;
                    }
                    else {
                        continue;
                    }
                }
                let apex = card.shape.links[index].clone();
                let center = card.shape.rect.center;
                CardView.drawLink(apex, center, inward);
                if (card.cardType === Model.CardType.group) {
                    View.context.fillStyle = CardView.colors.card.link;
                }
                else {
                    View.context.fillStyle = CardView.colors.rootCard.link;
                }
                View.context.fill();
            }
            // draw has-acted icon
            if (View.turnObject.getHasActed(card)) {
                let center = new Util.Point(card.shape.rect.lowerRight.x, card.shape.rect.upperLeft.y);
                let radius = View.cardLength * CardView.arrowSize;
                center.move(-radius, radius);
                View.context.arc(center.x, center.y, radius - 2, 0, Math.PI * 2);
                View.context.fillStyle =
                    card.cardType === Model.CardType.group
                        ? CardView.colors.card.link
                        : CardView.colors.rootCard.link;
                View.context.fill();
            }
            // draw card name
            let center = card.shape.rect.center;
            if (card.cardType === Model.CardType.group) {
                View.context.fillStyle = CardView.colors.card.text;
            }
            else {
                View.context.fillStyle = CardView.colors.rootCard.text;
            }
            View.context.font = View.font;
            View.context.textAlign = 'center';
            View.context.textBaseline = 'middle';
            View.context.fillText(card.name.substring(0, View.cardLength / 8), center.x, center.y);
            // draw card cash
            if (card.cardLocation === Model.CardLocation.structure) {
                let cursor = card.shape.rect.lowerRight.clone();
                cursor.move(-2, -2);
                View.context.textAlign = 'right';
                View.context.textBaseline = 'alphabetic';
                View.context.fillStyle = CardView.colors.card.cash;
                View.context.fillText('' + card.cash, cursor.x, cursor.y);
            }
            // draw the card's children
            card.links.forEach((child, direction) => {
                if (typeof child !== 'number') {
                    let childDirection = (card.shape.rotation + direction + 2) % 4;
                    CardView.orient(child, card.shape.links[direction], childDirection);
                    CardView.draw(ctx, child);
                }
            });
        }
        static drawBorder(card) {
            this.drawRoundRect(card.shape.rect, View.getArcSize());
        }
        static drawHovered(card, ctx) {
            CardView.drawBorder(card);
            ctx.strokeStyle = CardView.colors.card.hoveredBorder;
            ctx.stroke();
        }
        static drawRoundRect(rect, cornerSize) {
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
        static drawLink(apex, center, inward) {
            let left = apex.clone();
            let right = apex.clone();
            let arrowSize = View.cardLength * CardView.arrowSize;
            let toCenter = center.minus(apex).normal.times(arrowSize);
            let toSide = toCenter.switched.dividedBy(2);
            left.add(toSide);
            right.add(toSide.negative);
            if (inward) {
                apex.add(toCenter);
            }
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
        static orient(card, stem, direction) {
            // stem point already shifted by focus
            // cardLength already determined from view
            card.shape.stem.copy(stem);
            card.shape.links[0].copy(stem);
            card.shape.links[1].copy(stem);
            card.shape.links[2].copy(stem);
            card.shape.links[3].copy(stem);
            card.shape.rotation = direction;
            let cardWidth = View.cardLength * View.widthRatio;
            let x, y, w, h;
            if (direction === 0) {
                w = View.cardLength;
                h = cardWidth;
                x = stem.x;
                y = stem.y - h / 2;
                card.shape.links[1].move(w / 2, -h / 2);
                card.shape.links[2].movex(w);
                card.shape.links[3].move(w / 2, h / 2);
            }
            else if (direction === 1) {
                w = cardWidth;
                h = View.cardLength;
                x = stem.x - w / 2;
                y = stem.y;
                card.shape.links[1].move(w / 2, h / 2);
                card.shape.links[2].movey(h);
                card.shape.links[3].move(-w / 2, h / 2);
            }
            else if (direction === 2) {
                w = View.cardLength;
                h = cardWidth;
                x = stem.x - w;
                y = stem.y - h / 2;
                card.shape.links[1].move(-w / 2, h / 2);
                card.shape.links[2].movex(-w);
                card.shape.links[3].move(-w / 2, -h / 2);
            }
            else if (direction === 3) {
                w = cardWidth;
                h = View.cardLength;
                x = stem.x - w / 2;
                y = stem.y - h;
                card.shape.links[1].move(-w / 2, -h / 2);
                card.shape.links[2].movey(-h);
                card.shape.links[3].move(w / 2, -h / 2);
            }
            card.shape.rect.set(x, y, w, h);
        }
    }
    CardView.arrowSize = 0.1;
    CardView.cornerSize = 0.15;
    CardView.colors = {
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
    View_1.CardView = CardView;
    class Button {
        constructor(caption, callback, ulCorner, id = '') {
            this.caption = caption;
            this.callback = callback;
            this.ulCorner = ulCorner;
            this.id = id;
            this.font = View.boldFont;
            this.outline = true;
            this.selected = false;
            this.visible = true;
            this.disabled = false;
            this.textAlign = 'center';
            this.rect = new Util.Rectangle(ulCorner.x, ulCorner.y, Button.size.x, Button.size.y);
        }
        static getButton(buttonSet, id) {
            return buttonSet.find((btn) => btn.id === id);
        }
        static getHoveredButton(buttonSet, mouse) {
            for (let btn of buttonSet) {
                if (btn.hovered(mouse)) {
                    return btn;
                }
            }
            return null;
        }
        get textPoint() {
            if (this.textAlign === 'center') {
                return this.rect.center;
            }
            else {
                let x = this.rect.upperLeft.x;
                let y = this.rect.upperLeft.y + Button.size.y / 3;
                return new Util.Point(x, y);
            }
        }
        draw(c, hovered) {
            if (!this.visible) {
                return;
            }
            if (this.outline) {
                CardView.drawRoundRect(this.rect, 10);
                if (hovered) {
                    View.context.fillStyle = Button.colors.hoveredFill;
                }
                else if (this.selected) {
                    View.context.fillStyle = Button.colors.selectedFill;
                }
                else {
                    View.context.fillStyle = Button.colors.fill;
                }
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
        hovered(mouse) {
            return this.rect.contains(mouse);
        }
        moveTo(point) {
            let dims = this.rect.lowerRight.minus(this.rect.upperLeft);
            this.rect.upperLeft.copy(point);
            this.rect.lowerRight.copy(point.plus(dims));
        }
        sety(y) {
            this.rect.upperLeft.y = y;
            this.rect.lowerRight.y = y + Button.size.y;
        }
        setWidth(w) {
            this.rect.lowerRight.x = this.rect.upperLeft.x + w;
        }
    }
    Button.size = new Util.Point(80, 18);
    Button.colors = {
        fill: '#efefef',
        border: '#ccc',
        text: 'gray',
        hoveredFill: 'gray',
        hoveredText: 'orange',
        selectedFill: '#ccf',
    };
    View_1.Button = Button;
    class Dialog {
        constructor(caption, callback) {
            this.caption = caption;
            this.callback = callback;
            this.ok = true; // false if cancel clicked
            this.visible = false;
            this.elements = [];
            this.buttons = [];
            this.hoveredButton = null;
            let ok = new Button('ok', this.btnOk, new Util.Point(), 'ok');
            ok.data = this;
            let cancel = new Button('cancel', this.btnCancel, new Util.Point(), 'cancel');
            cancel.data = this;
            this.buttons.push(ok, cancel);
        }
        addTransfer(id, nameOne, valueOne, nameTwo, valueTwo) {
            let name1 = nameOne.substr(0, 10);
            let name2 = nameTwo.substr(0, 10);
            let elem = {
                type: ElementType.transfer,
                id: id,
                left: new Button(name1 + ': ' + valueOne, this.btnTransfer, new Util.Point()),
                right: new Button(name2 + ': ' + valueTwo, this.btnTransfer, new Util.Point()),
                leftName: name1, leftValue: valueOne,
                rightName: name2, rightValue: valueTwo,
            };
            elem.left.data = { element: elem, dialog: this };
            elem.right.data = { element: elem, dialog: this };
            this.buttons.push(elem.left, elem.right);
            this.elements.push(elem);
        }
        configureTransfer(id, nameOne, valueOne, nameTwo, valueTwo) {
            let name1 = nameOne.substr(0, 10);
            let name2 = nameTwo.substr(0, 10);
            let xfer = null;
            for (let elem of this.elements) {
                if (elem.id === id) {
                    xfer = elem;
                    break;
                }
            }
            if (xfer) {
                xfer.leftName = name1;
                xfer.leftValue = valueOne;
                xfer.rightName = name2;
                xfer.rightValue = valueTwo;
                this.updateTransferButtons(xfer);
            }
        }
        draw(ctx) {
            let cWidth = View.canvas.width;
            let cHeight = View.canvas.height;
            let height = Dialog.lineHeight * (2 + this.elements.length);
            let width = 200;
            let upLeft = new Util.Point(cWidth / 2 - width / 2, cHeight / 2 - height / 2);
            let dialogRect = new Util.Rectangle(upLeft.x, upLeft.y, width, height);
            ctx.fillStyle = Dialog.colors.fill;
            ctx.fillRect(upLeft.x, upLeft.y, width, height);
            ctx.strokeStyle = Dialog.colors.border;
            ctx.strokeRect(upLeft.x, upLeft.y, width, height);
            let cursor = new Util.Point(cWidth / 2, upLeft.y);
            // caption
            ctx.font = View.boldFont;
            ctx.fillStyle = Dialog.colors.text;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(this.caption, cursor.x, cursor.y + Dialog.lineHeight / 2);
            // elements
            // TOSO: convert rects below to Button objects
            let gutter = 5;
            for (let elem of this.elements) {
                cursor.y += Dialog.lineHeight;
                if (elem.type === ElementType.transfer) {
                    elem.left.rect.set(dialogRect.upperLeft.x + gutter, cursor.y + gutter, width / 2 - gutter * 2, Dialog.lineHeight - gutter * 2);
                    (elem.left).draw(ctx, elem.left === this.hoveredButton);
                    elem.right.rect.set(cWidth / 2 + gutter, cursor.y + gutter, width / 2 - gutter * 2, Dialog.lineHeight - gutter * 2);
                    (elem.right).draw(ctx, elem.right === this.hoveredButton);
                }
            }
            // ok / cancel
            cursor.y += Dialog.lineHeight;
            let ok = Button.getButton(this.buttons, 'ok');
            ok.moveTo(cursor.shifted(-Button.size.x - gutter, 0));
            ok.draw(ctx, ok === this.hoveredButton);
            let cancel = Button.getButton(this.buttons, 'cancel');
            cancel.moveTo(cursor.shifted(gutter, 0));
            cancel.draw(ctx, cancel === this.hoveredButton);
        }
        updateTransferButtons(elem) {
            elem.left.caption = elem.leftName + ': ' + elem.leftValue;
            elem.right.caption = elem.rightName + ': ' + elem.rightValue;
        }
        get data() {
            let data = {};
            for (let elem of this.elements) {
                data[elem.id] = elem;
            }
            return data;
        }
        // mouse events
        onMouseMove(mouse) {
            this.hoveredButton = Button.getHoveredButton(this.buttons, mouse);
            View.drawPage();
        }
        onMouseClick(mouse) {
            this.hoveredButton.callback(this.hoveredButton);
            View.drawPage();
        }
        // buttons
        btnTransfer(btn) {
            let elem = btn.data.element;
            if (btn === elem.left) {
                if (elem.rightValue > 0) {
                    elem.rightValue--;
                    elem.leftValue++;
                }
            }
            else {
                if (elem.leftValue > 0) {
                    elem.leftValue--;
                    elem.rightValue++;
                }
            }
            btn.data.dialog.updateTransferButtons(elem);
            View.drawPage();
        }
        btnOk(btn) {
            btn.data.ok = true;
            btn.data.callback(btn.data);
        }
        btnCancel(btn) {
            btn.data.ok = false;
            btn.data.callback(btn.data);
        }
        static getDialog(dialogSet, name) {
            for (let dlg of dialogSet) {
                if (dlg.caption === name) {
                    return dlg;
                }
            }
        }
    }
    Dialog.lineHeight = 30;
    Dialog.colors = {
        fill: 'white',
        border: 'gray',
        text: 'gray',
    };
    View_1.Dialog = Dialog;
    class View {
        static init(controlCallback, turnObj) {
            View.callback = controlCallback;
            View.turnObject = turnObj;
            View.screenState = State.table;
            View.canvas = document.getElementById('canvas');
            View.context = View.canvas.getContext('2d');
            View.focus = new Util.Point(View.canvas.width / 2, View.canvas.height / 2);
            this.orientRootCards(Model.Model.factions);
            this.drawPage();
        }
        static dragFocus(delta) {
            View.focus.move(delta.x, delta.y);
        }
        static clear() {
            let w = View.canvas.width;
            let h = View.canvas.height;
            let c = View.context;
            c.fillStyle = View.colors.screen.fill;
            c.fillRect(0, 0, w, h);
        }
        static drawPage() {
            View.clear();
            if (View.screenState === State.attackSetup) {
                PageAttack.draw(View.context);
            }
            else if (View.screenState === State.table) {
                PageTable.draw(View.context);
            }
            else if (View.screenState === State.detail) {
                PageDetail.draw(View.context);
            }
        }
        ;
        static getHoveredButton(btnSet, mouse) {
            for (let btn of btnSet) {
                if (btn.hovered(mouse)) {
                    return btn;
                }
            }
            return null;
        }
        static orientRootCards(factions) {
            factions.forEach((faction, index) => {
                faction.root.shape.rootPoint = new Util.Point(-View.cardLength / 2, -View.cardLength / 2);
                CardView.orient(faction.root, faction.root.shape.rootPoint, 0);
            });
        }
        static get font() {
            return View.textSize + "px sans-serif";
        }
        static get boldFont() {
            return "bold " + View.textSize + "px sans-serif";
        }
        // page events
        static onMouseMove(mouse, dragDelta = null) {
            switch (this.screenState) {
                case State.attackSetup:
                    PageAttack.onMouseMove(mouse);
                    break;
                case State.table:
                    PageTable.onMouseMove(mouse);
                    break;
                case State.detail:
                    PageDetail.onMouseMove(mouse);
                    break;
            }
        }
        static onMouseClick(mouse) {
            switch (this.screenState) {
                case State.attackSetup:
                    PageAttack.onMouseClick(mouse);
                    break;
                case State.table:
                    PageTable.onMouseClick(mouse);
                    break;
                case State.detail:
                    PageDetail.onMouseClick(mouse);
                    break;
            }
        }
        // draw helper functions
        static beginPath() {
            this.context.beginPath();
        }
        static moveTo(p) {
            this.context.moveTo(p.x, p.y);
        }
        static lineTo(p) {
            this.context.lineTo(p.x, p.y);
        }
        static arcTo(p1, p2, rad = this.getArcSize()) {
            this.context.arcTo(p1.x, p1.y, p2.x, p2.y, rad);
        }
        static getArcSize() {
            return this.arcRadius * this.cardLength;
        }
    }
    View.arcRadius = 0.15;
    View.widthRatio = 0.7;
    View.cardLength = 50; // changes with zoom
    View.hoveredButton = null;
    View.hoveredCard = null;
    View.textSize = 10;
    View.colors = {
        screen: {
            fill: '#f8f8f8',
            headerFill: '#eee',
        },
    };
    View_1.View = View;
    class PageAttack {
        static init(atkCallback) {
            PageAttack.callback = atkCallback;
            this.reset();
            let lineHeight = 22;
            let cursor = new Util.Point(0, 0);
            // attack type
            cursor.set(View.canvas.width - Button.size.x - 10, 10);
            let cmd1 = new Button('control', PageAttack.btnAtkType, new Util.Point(cursor.x, cursor.y), 'control');
            cursor.movey(lineHeight);
            let cmd2 = new Button('neutralize', PageAttack.btnAtkType, new Util.Point(cursor.x, cursor.y), 'neutralize');
            cursor.movey(lineHeight);
            let cmd3 = new Button('destroy', PageAttack.btnAtkType, new Util.Point(cursor.x, cursor.y), 'destroy');
            cmd1.selected = true;
            let data = { group: [cmd1, cmd2, cmd3] };
            cmd1.data = data;
            cmd2.data = data;
            cmd3.data = data;
            this.buttons.push(cmd1, cmd2, cmd3);
            // done
            cursor.movey(lineHeight * 3);
            let done = new Button('done', PageAttack.btnDone, cursor);
            done.visible = false;
            this.buttons.push(done);
            // leverage cash buttons
            cursor.movex(-Button.size.x - 5);
            cursor.movey(lineHeight * 2);
            this.buttons.push(new Button('more', PageAttack.btnOwnCashMore, cursor, 'own_cash_more'));
            this.buttons.push(new Button('less', PageAttack.btnOwnCashLess, cursor.shifted(Button.size.x + 5, 0), 'own_cash_less'));
            cursor.movey(lineHeight * 2);
            let rootMore = new Button('more', PageAttack.btnRootCashMore, cursor, 'root_cash_more');
            let rootLess = new Button('less', PageAttack.btnRootCashLess, cursor.shifted(Button.size.x + 5, 0), 'root_cash_less');
            this.buttons.push(rootMore, rootLess);
            // exec & cancel
            cursor.movey(lineHeight * 2);
            this.buttons.push(new Button('execute', PageAttack.btnExecuteAttack, cursor, 'execute'));
            this.buttons.push(new Button('cancel', PageAttack.btnCancelAttack, cursor.shifted(Button.size.x + 5, 0), 'cancel'));
        }
        static reset() {
            PageAttack.state = AttackState.setup;
            PageAttack.roll = 0;
            PageAttack.attackerCash = 0;
            PageAttack.rootCash = 0;
            for (let btn of PageAttack.buttons) {
                if (btn.caption === 'done') {
                    btn.visible = false;
                }
                else {
                    btn.visible = true;
                }
            }
        }
        static initDoneState() {
            for (let btn of PageAttack.buttons) {
                if (btn.caption === 'done') {
                    btn.visible = true;
                }
                else {
                    btn.visible = false;
                }
            }
        }
        static draw(ctx) {
            let leftMargin = 10;
            let lineHeight = 15;
            let attacker = PageAttack.callback({ command: 'getAttacker' });
            let defender = PageAttack.callback({ command: 'getDefender' });
            let cursor = new Util.Point(leftMargin, lineHeight);
            ctx.fillStyle = PageAttack.colors.text;
            ctx.font = View.font;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            let typeLine = 'attack type: ' + PageAttack.attackType;
            ctx.fillText(typeLine, cursor.x, cursor.y);
            cursor.movey(lineHeight);
            let atkLine = 'attacker: ' + attacker.name + ' (' + attacker.attack + ')';
            atkLine += ' (' + attacker.alignments + ')';
            ctx.fillText(atkLine, cursor.x, cursor.y);
            cursor.movey(lineHeight);
            let defLine = 'defender: ' + defender.name + ' (' + PageAttack.defenseAttribute + ')';
            defLine += ' (' + defender.alignments + ')';
            ctx.fillText(defLine, cursor.x, cursor.y);
            // totals
            cursor.movey(lineHeight * 2);
            let cursor2 = cursor.clone();
            ctx.fillText('total attack: ' + PageAttack.attackTotal, cursor.x, cursor.y);
            cursor.movey(lineHeight);
            ctx.fillText('total defense: ' + PageAttack.defenseTotal, cursor.x, cursor.y);
            cursor.movey(lineHeight);
            ctx.fillText('roll needed: ' + (PageAttack.attackTotal - PageAttack.defenseTotal) + ' or less', cursor.x, cursor.y);
            // show bonuses
            cursor2.movex(120);
            ctx.fillText('alignment bonus: ' + PageAttack.alignmentBonus, cursor2.x, cursor2.y);
            cursor2.movey(lineHeight);
            ctx.fillText('illuminati defense: ' + 0, cursor2.x, cursor2.y); // TODO
            // results
            cursor.movey(lineHeight * 2);
            if (PageAttack.roll > 0) {
                ctx.fillText('roll: ' + PageAttack.roll, cursor.x, cursor.y);
                cursor.movey(lineHeight);
                if (PageAttack.state === AttackState.success) {
                    ctx.fillText('success!', cursor.x, cursor.y);
                }
                else {
                    ctx.fillText('failure!', cursor.x, cursor.y);
                }
            }
            // cash
            cursor.set(View.canvas.width - Button.size.x * 2 - 15, 150);
            ctx.fillText('leverage cash to improve odds', cursor.x, cursor.y);
            cursor.movey(lineHeight);
            ctx.fillText('attacker cash: ' + attacker.cash + 'MB', cursor.x, cursor.y);
            cursor.movey(lineHeight);
            ctx.fillText('leveraged: ' + PageAttack.attackerCash + 'MB', cursor.x, cursor.y);
            cursor.movey(lineHeight / 2);
            Button.getButton(PageAttack.buttons, 'own_cash_more').sety(cursor.y);
            Button.getButton(PageAttack.buttons, 'own_cash_less').sety(cursor.y);
            let root_cash_more = Button.getButton(PageAttack.buttons, 'root_cash_more');
            let root_cash_less = Button.getButton(PageAttack.buttons, 'root_cash_less');
            if (attacker.cardType === Model.CardType.root) {
                root_cash_more.visible = false;
                root_cash_less.visible = false;
            }
            else {
                root_cash_more.visible = true;
                root_cash_less.visible = true;
                let root = attacker.getRoot();
                cursor.movey(lineHeight * 2);
                ctx.fillText('root cash: ' + root.cash + 'MB', cursor.x, cursor.y);
                cursor.movey(lineHeight);
                ctx.fillText('leveraged: ' + PageAttack.rootCash + 'MB', cursor.x, cursor.y);
                cursor.movey(lineHeight / 2);
                root_cash_more.sety(cursor.y);
                root_cash_less.sety(cursor.y);
            }
            // execute and cancel
            cursor.movey(lineHeight * 2);
            Button.getButton(PageAttack.buttons, 'execute').sety(cursor.y);
            Button.getButton(PageAttack.buttons, 'cancel').sety(cursor.y);
            // buttons
            if (attacker.openLinks.length === 0) {
                let controlBtn = Button.getButton(PageAttack.buttons, 'control');
                controlBtn.disabled = true;
                controlBtn.selected = false;
                if (PageAttack.attackType === 'control') {
                    PageAttack.attackType = '';
                }
            }
            for (let btn of PageAttack.buttons) {
                btn.draw(ctx, btn === PageAttack.hoveredButton);
            }
        }
        // accessors
        static get alignmentBonus() {
            let attacker = PageAttack.callback({ command: 'getAttacker' });
            let defender = PageAttack.callback({ command: 'getDefender' });
            let comparison = Model.Alignment.compare(attacker.alignments, defender.alignments);
            let alignBonus = 0;
            if (PageAttack.attackType === 'control') {
                alignBonus = comparison.same * 4 - comparison.opposite * 4;
            }
            else if (PageAttack.attackType === 'neutralize') {
                alignBonus = 6 + comparison.same * 4 - comparison.opposite * 4;
            }
            else if (PageAttack.attackType === 'destroy') {
                alignBonus = comparison.opposite * 4 - comparison.same * 4;
            }
            return alignBonus;
        }
        static get attackTotal() {
            let attacker = PageAttack.callback({ command: 'getAttacker' });
            return attacker.attack + PageAttack.alignmentBonus + PageAttack.attackerCash + PageAttack.rootCash;
        }
        static get defenseAttribute() {
            let defender = PageAttack.callback({ command: 'getDefender' });
            let defenseAttribute = defender.defense;
            if (PageAttack.attackType === 'destroy') {
                defenseAttribute = defender.attack;
            }
            return defenseAttribute;
        }
        static get defenseTotal() {
            let defender = PageAttack.callback({ command: 'getDefender' });
            return PageAttack.defenseAttribute + defender.getRootProtection();
        }
        // button events
        static btnAtkType(button) {
            for (let btn of button.data.group) {
                btn.selected = false;
            }
            button.selected = true;
            PageAttack.attackType = button.caption;
            View.drawPage();
        }
        static btnExecuteAttack(button) {
            // make the roll
            PageAttack.roll = Util.randomInt(1, 6) + Util.randomInt(1, 6);
            // determine success
            let needed = PageAttack.attackTotal - PageAttack.defenseTotal;
            if (needed > 10) {
                needed = 10;
            }
            if (PageAttack.roll <= needed) {
                PageAttack.state = AttackState.success;
            }
            else {
                PageAttack.state = AttackState.failure;
            }
            // spend cash used in attack
            let attacker = PageAttack.callback({ command: 'getAttacker' });
            attacker.cash -= PageAttack.attackerCash;
            let root = attacker.getRoot();
            root.cash -= PageAttack.rootCash;
            PageAttack.initDoneState();
            View.drawPage();
        }
        static btnCancelAttack(button) {
            PageAttack.callback({ command: 'cancelAttack' });
            View.screenState = State.table;
            PageAttack.reset();
            View.drawPage();
        }
        static btnDone(button) {
            PageAttack.callback({ command: 'attackerDone' });
            View.screenState = State.table;
            if (PageAttack.state === AttackState.failure) {
                PageAttack.callback({ command: 'cancelAttack' });
            }
            else if (PageAttack.attackType === 'control') {
                PageAttack.callback({ command: 'controlSuccess' });
            }
            else if (PageAttack.attackType === 'neutralize') {
                PageAttack.callback({ command: 'neutralizeSuccess' });
            }
            else if (PageAttack.attackType === 'destroy') {
                PageAttack.callback({ command: 'destroySuccess' });
            }
            PageAttack.reset();
            View.drawPage();
        }
        static btnOwnCashMore(btn) {
            let attacker = PageAttack.callback({ command: 'getAttacker' });
            if (PageAttack.attackerCash < attacker.cash) {
                ++PageAttack.attackerCash;
            }
            View.drawPage();
        }
        static btnOwnCashLess(btn) {
            if (PageAttack.attackerCash > 0) {
                --PageAttack.attackerCash;
            }
            View.drawPage();
        }
        static btnRootCashMore(btn) {
            let attacker = PageAttack.callback({ command: 'getAttacker' });
            let root = attacker.getRoot();
            if (PageAttack.rootCash < root.cash) {
                ++PageAttack.rootCash;
            }
            View.drawPage();
        }
        static btnRootCashLess(btn) {
            if (PageAttack.rootCash > 0) {
                --PageAttack.rootCash;
            }
            View.drawPage();
        }
        // mouse event
        static onMouseMove(mouse) {
            let buttonSet = this.buttons.filter((btn) => btn.visible === true);
            this.hoveredButton = Button.getHoveredButton(buttonSet, mouse);
            View.drawPage();
        }
        static onMouseClick(mouse) {
            if (this.hoveredButton) {
                this.hoveredButton.callback(this.hoveredButton);
            }
        }
    }
    PageAttack.buttons = [];
    PageAttack.hoveredButton = null;
    PageAttack.attackType = 'control';
    PageAttack.attackerCash = 0;
    PageAttack.rootCash = 0;
    PageAttack.roll = 0;
    PageAttack.colors = {
        text: 'gray',
    };
    View_1.PageAttack = PageAttack;
    class PageDetail {
        static init(callback) {
            PageDetail.callback = callback;
            PageDetail.buttons = [
                new Button('move', PageDetail.btnMoveGroup, new Util.Point(20, 100), 'move'),
                new Button('attack', PageDetail.btnAttack, new Util.Point(25 + Button.size.x, 100), 'attack'),
                new Button('cash xfer', PageDetail.btnCashXfer, new Util.Point(30 + Button.size.x * 2, 100), 'cashXfer'),
            ];
        }
        static draw(ctx) {
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
            if (card.aid > 0) {
                atk += '/' + card.aid;
            }
            let def = card.defense;
            ctx.fillText('attack: ' + atk + '  defense: ' + def, cursor.x, cursor.y);
            cursor.movey(lineHeight);
            ctx.fillText('income: ' + card.income, cursor.x, cursor.y);
            let protection = card.getRootProtection();
            if (protection > 0) {
                cursor.movey(lineHeight);
                ctx.fillText('protection from illuminati: ' + protection, cursor.x, cursor.y);
            }
            // specials
            if (card.specials.length > 0) {
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
            cursor.movey(lineHeight * 2);
            ctx.fillText('children:', cursor.x, cursor.y);
            if (card.children.length === 0) {
                cursor.movey(lineHeight);
                ctx.fillText('none', cursor.x + 10, cursor.y);
            }
            else {
                for (let child of card.children) {
                    cursor.movey(lineHeight);
                    ctx.fillText(child.name, cursor.x + 10, cursor.y);
                }
            }
            // buttons
            cursor.movey(lineHeight * 2);
            Button.getButton(PageDetail.buttons, 'move').sety(cursor.y);
            Button.getButton(PageDetail.buttons, 'attack').sety(cursor.y);
            Button.getButton(PageDetail.buttons, 'cashXfer').sety(cursor.y);
            for (let btn of PageDetail.buttons) {
                if (btn.caption === 'attack') {
                    if (Control.Turn.actionsTaken >= 2) {
                        continue;
                    }
                    if (Control.Turn.getHasActed(card)) {
                        continue;
                    }
                    if (card.attack === 0) {
                        continue;
                    }
                }
                if (btn.caption === 'move' && card.cardType === Model.CardType.root) {
                    continue;
                }
                if (btn.caption === 'cash xfer') {
                    let adjacent = Model.Deck.getAdjacentCards(card);
                    if (adjacent.length === 0) {
                        continue;
                    }
                }
                btn.draw(ctx, btn === PageDetail.hoveredButton);
            }
        }
        static onMouseMove(mouse) {
            let buttonSet = PageDetail.buttons.filter((btn) => btn.visible === true);
            PageDetail.hoveredButton = Button.getHoveredButton(buttonSet, mouse);
            View.drawPage();
        }
        static onMouseClick(mouse) {
            if (PageDetail.hoveredButton) {
                PageDetail.hoveredButton.callback(PageDetail.hoveredButton);
            }
            else {
                View.screenState = State.table;
                View.drawPage();
            }
        }
        static btnMoveGroup(btn) {
            PageDetail.callback({ command: 'btnMoveGroup' })(btn);
        }
        static btnAttack(btn) {
            PageDetail.callback({ command: 'btnAttack' })(btn);
        }
        static btnCashXfer(btn) {
            PageDetail.callback({ command: 'btnCashXfer' })(btn);
        }
    }
    PageDetail.buttons = [];
    PageDetail.colors = {
        text: 'gray',
    };
    View_1.PageDetail = PageDetail;
    class PageTable {
        static init(callback) {
            PageTable.callback = callback;
            PageTable.state = TableState.normal;
            let cursor = new Util.Point(View.canvas.width - Button.size.x, View.canvas.height - PageTable.footerHeight);
            cursor.move(-10, 10);
            PageTable.buttons.push(new Button('end turn', PageTable.callback({ command: 'btnEndTurn' }), cursor));
            // faction selection buttons
            cursor.set(10, View.canvas.height - 15);
            for (let i = Model.Model.factions.length - 1; i >= 0; --i) {
                let faction = Model.Model.factions[i];
                let btn = new Button(faction.root.name, PageTable.callback('btnShowFaction'), cursor.clone());
                btn.data = faction;
                btn.outline = false;
                btn.textAlign = 'left';
                btn.data = faction;
                PageTable.factionButtons.push(btn);
                cursor.movey(-14);
            }
            let dialog = new Dialog('transfer cash', PageTable.cashXferCallback);
            dialog.addTransfer('cashXfer', 'one', 1, 'two', 2);
            this.dialogs.push(dialog);
        }
        static cashXferCallback(dlg) {
            console.log('dialogTest', dlg);
            let data = dlg.data;
            PageTable.callback({ command: 'cashXferFinish', value: dlg });
            dlg.visible = false;
            View.drawPage();
        }
        static get footerHeight() { return View.cardLength * 1.4; }
        static draw(ctx) {
            // structure
            let faction = View.turnObject.factionShown;
            CardView.orient(faction.root, faction.root.shape.rootPoint.plus(View.focus), 0);
            CardView.draw(ctx, faction.root);
            // header: uncontrolled
            ctx.fillStyle = PageTable.colors.headerFill;
            ctx.fillRect(0, 0, View.canvas.width, View.cardLength * 1.4);
            let open = Model.Deck.openCards;
            let cursor = new Util.Point(View.cardLength / 2, 10);
            for (let card of open) {
                CardView.orient(card, cursor, 1);
                CardView.draw(ctx, card);
                cursor.movex(View.cardLength);
            }
            // footer: faction selection, hand, buttons
            let height = PageTable.footerHeight;
            ctx.fillStyle = PageTable.colors.headerFill;
            ctx.fillRect(0, View.canvas.height - height, View.canvas.width, height);
            for (let btn of PageTable.factionButtons) {
                if (btn.data === View.turnObject.faction) {
                    btn.font = View.boldFont;
                }
                else {
                    btn.font = View.font;
                }
                btn.draw(ctx, btn === View.hoveredButton);
            }
            for (let btn of PageTable.buttons) {
                btn.draw(ctx, btn === View.hoveredButton);
            }
            // DEBUG: draw page state above footer
            cursor.set(10, View.canvas.height - height - 10);
            ctx.font = View.font;
            ctx.textAlign = 'left';
            let message = 'table state: ' + TableState[PageTable.state];
            ctx.fillText(message, cursor.x, cursor.y);
            // hovered
            if (PageTable.state === TableState.chooseLink) {
                if (PageTable.mouse) {
                    let height = View.cardLength;
                    let width = View.cardLength * View.widthRatio;
                    let rect = new Util.Rectangle(PageTable.mouse.x - width / 2, PageTable.mouse.y - height / 2, width, height);
                    CardView.drawRoundRect(rect, View.getArcSize());
                    ctx.strokeStyle = '#aaa';
                    ctx.stroke();
                }
            }
            else if (Control.Control.command === Control.Command.cashXfer) {
                if (View.hoveredCard && PageTable.cardTargets.indexOf(View.hoveredCard) !== -1) {
                    CardView.drawHovered(View.hoveredCard, ctx);
                }
            }
            else if (View.hoveredCard) {
                CardView.drawHovered(View.hoveredCard, ctx);
            }
            // dialogs
            for (let dlg of PageTable.dialogs) {
                if (dlg.visible) {
                    dlg.draw(ctx);
                }
            }
        }
        static drawLinkChoice(closest) {
            View.drawPage();
            if (!closest) {
                return;
            }
            View.beginPath();
            View.context.arc(closest.point.x, closest.point.y, View.getArcSize(), 0, 2 * Math.PI, false);
            View.context.strokeStyle = 'red';
            View.context.stroke();
        }
        static openCashXferDialog() {
            let dlg = Dialog.getDialog(PageTable.dialogs, 'transfer cash');
            let xfer = dlg.configureTransfer('cashXfer', Control.Attack.attacker.name, Control.Attack.attacker.cash, Control.Attack.defender.name, Control.Attack.defender.cash);
            dlg.visible = true;
        }
        static onMouseMove(mouse) {
            PageTable.mouse = mouse;
            for (let dlg of PageTable.dialogs) {
                if (dlg.visible) {
                    dlg.onMouseMove(mouse);
                    return;
                }
            }
            if (PageTable.state === TableState.chooseLink) {
                let closest = null;
                let sqDist = 0;
                let minDist = Math.pow(View.cardLength, 2);
                for (let target of this.linkTargets) {
                    let d2 = mouse.distSquared(target.point);
                    if (d2 > minDist) {
                        continue;
                    }
                    if (closest === null || d2 < sqDist) {
                        closest = target;
                        sqDist = d2;
                    }
                }
                this.hoveredLink = closest;
                PageTable.drawLinkChoice(closest);
            }
            else {
                let dirty = false;
                let cardSet;
                if (PageTable.callback({ command: 'commandIsAttack' })) {
                    cardSet = Model.Deck.attackTargets;
                }
                else {
                    cardSet = Model.Deck.tableCards;
                }
                let hovered = Model.Model.getHoveredCard(mouse, cardSet);
                if (hovered !== View.hoveredCard) {
                    View.hoveredCard = hovered;
                    dirty = true;
                }
                let btn = View.getHoveredButton(PageTable.factionButtons.concat(PageTable.buttons), mouse);
                if (btn !== View.hoveredButton) {
                    View.hoveredButton = btn;
                    dirty = true;
                }
                if (dirty) {
                    View.drawPage();
                }
            }
        }
        static onMouseClick(mouse) {
            for (let dlg of PageTable.dialogs) {
                if (dlg.visible) {
                    dlg.onMouseClick(mouse);
                    return;
                }
            }
            if (Control.Control.command === Control.Command.cashXfer) {
                PageTable.callback({ command: 'cashXferTarget' });
            }
            else if (PageTable.state === TableState.chooseLink) {
                // TODO: check for card overlap
                if (PageTable.hoveredLink) {
                    let defender = PageAttack.callback({ command: 'getDefender' });
                    defender.decouple();
                    PageTable.hoveredLink.card.addCard(defender, PageTable.hoveredLink.linkIndex);
                    PageTable.callback({ command: 'clearCommand' });
                    PageTable.state = TableState.normal;
                    View.canvas.style.cursor = '';
                    View.drawPage();
                }
            }
            else if (View.hoveredButton) {
                View.hoveredButton.callback(View.hoveredButton);
            }
            else if (View.hoveredCard) {
                if (PageTable.callback({ command: 'commandIsAttack' })) {
                    View.canvas.style.cursor = '';
                    PageTable.callback({ command: 'setDefender', value: View.hoveredCard });
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
    PageTable.hoveredLink = null;
    PageTable.buttons = [];
    PageTable.factionButtons = [];
    PageTable.dialogs = [];
    PageTable.colors = {
        headerFill: '#eee',
    };
    View_1.PageTable = PageTable;
})(View || (View = {}));
// TODO: show somehow that the "hovered" card is getting moved (gray out or attach to mouse)
// TODO: if the card is a special, put it in the player's "hand"
var Control;
(function (Control_1) {
    let Command;
    (function (Command) {
        Command[Command["attack"] = 0] = "attack";
        Command[Command["cashXfer"] = 1] = "cashXfer";
        Command[Command["none"] = 2] = "none";
        Command[Command["placeCard"] = 3] = "placeCard";
    })(Command = Control_1.Command || (Control_1.Command = {}));
    ;
    class Control {
        static init() {
            Model.Deck.init();
            Model.Model.initFactions(2);
            Model.Alignment.init();
            Turn.initTurn(0);
            for (let i = 0; i < 4; ++i) {
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
        get commandString() {
            return Command[Control.command];
        }
        static viewCallback(command) {
            switch (command) {
                case 'btnMoveGroup': return Control.btnMoveGroup;
                case 'btnAttack': return Control.btnAttack;
            }
        }
        static attackCallback(data) {
            switch (data.command) {
                case 'attackerDone':
                    Turn.setHasActed(Attack.attacker);
                    break;
                case 'cancelAttack':
                    Control.cancelAttack();
                    break;
                case 'controlSuccess':
                    Control.controlSuccess();
                    break;
                case 'neutralizeSuccess':
                    Control.neutralizeSuccess();
                    break;
                case 'destroySuccess':
                    Control.destroySuccess();
                    break;
                case 'getDefender': return Attack.defender;
                case 'getAttacker': return Attack.attacker;
            }
        }
        static tableCallback(data) {
            switch (data.command) {
                case 'commandIsAttack': return Control.command == Command.attack;
                case 'setDefender':
                    Attack.setDefender(data.value);
                    break;
                case 'clearCommand':
                    Control.command = Command.none;
                    break;
                case 'btnEndTurn': return Control.btnEndTurn;
                case 'btnShowFaction': return Control.btnShowFaction;
                case 'cashXferTarget':
                    Control.beginCashXfer();
                    break;
                case 'cashXferFinish': return Control.cashXferFinish(data.value);
            }
        }
        static detailCallback(data) {
            console.log('detailCallback', data);
            switch (data.command) {
                case 'btnMoveGroup': return Control.btnMoveGroup;
                case 'btnAttack': return Control.btnAttack;
                case 'btnCashXfer': return Control.btnCashXfer;
            }
        }
        static beginCashXfer() {
            Attack.setDefender(View.View.hoveredCard);
            View.PageTable.openCashXferDialog();
            View.View.canvas.style.cursor = '';
            View.View.drawPage();
        }
        static cashXferFinish(dialog) {
            if (dialog.ok) {
                let values = dialog.data;
                Attack.attacker.cash = values.cashXfer.leftValue;
                Attack.defender.cash = values.cashXfer.rightValue;
            }
            Control.command = Command.none;
            View.View.drawPage();
        }
        static beginChooseLink(cardToPlace, cardSet = Model.Deck.structureCards) {
            View.View.screenState = View.State.table;
            View.PageTable.state = View.TableState.chooseLink;
            View.PageTable.linkTargets = Model.Model.getLinkTargets(cardToPlace, cardSet);
            View.View.drawPage();
        }
        static beginChooseTarget() {
            View.View.screenState = View.State.table;
            View.View.canvas.style.cursor = 'crosshair';
            if (Control.command === Command.cashXfer) {
                View.PageTable.cardTargets = Model.Deck.getAdjacentCards(Attack.attacker);
            }
            View.View.drawPage();
        }
        static cancelAttack() {
            // Attack.clear();
            this.command = Command.none;
        }
        static restoreTableState() {
            View.View.screenState = View.State.table;
            Turn.factionShownIndex = Turn.factionIndex;
            View.View.drawPage();
        }
        static controlSuccess() {
            Control.command = Command.none;
            Control.restoreTableState();
            Attack.defender.faction = Attack.attacker.faction;
            Attack.defender.cardLocation = Model.CardLocation.structure;
            Control.beginChooseLink(Attack.defender, [Attack.attacker]);
        }
        static neutralizeSuccess() {
            Control.restoreTableState();
        }
        static destroySuccess() {
            Control.restoreTableState();
        }
        static onMouseDown(event) {
            this.mouse.down = true;
            this.mouse.drag = false;
            this.mouse.last = new Util.Point(event.offsetX, event.offsetY);
        }
        static onMouseMove(event) {
            let mouse = new Util.Point(event.offsetX, event.offsetY);
            if (Control.mouse.down && !mouse.equals(Control.mouse.last)) {
                Control.mouse.drag = true;
            }
            if (Control.mouse.drag && View.View.screenState === View.State.table) {
                let delta = mouse.minus(Control.mouse.last);
                View.View.dragFocus(delta);
                View.View.drawPage();
            }
            View.View.onMouseMove(mouse);
            this.mouse.last = mouse;
        }
        static onMouseOut(event) {
            this.mouse.down = false;
            this.mouse.drag = false;
        }
        static onMouseUp(event) {
            Control.mouse.drag = false;
            let mouse = new Util.Point(event.offsetX, event.offsetY);
            if (this.mouse.drag) { }
            else {
                View.View.onMouseClick(mouse);
            }
            this.mouse.down = false;
            this.mouse.drag = false;
        }
        static btnAttack(button) {
            Attack.setAttacker(View.View.hoveredCard);
            Control.command = Command.attack;
            Control.beginChooseTarget();
        }
        static btnCashXfer(button) {
            Attack.setAttacker(View.View.hoveredCard);
            Control.command = Command.cashXfer;
            Control.beginChooseTarget();
        }
        static btnMoveGroup(button) {
            console.log('btnMoveGroup');
        }
        static btnShowFaction(button) {
            Turn.factionShownIndex = Model.Model.factions.indexOf(button.data);
            View.View.drawPage();
        }
        static btnEndTurn(button) {
            Turn.nextTurn();
            View.View.drawPage();
        }
    }
    Control.hoveredCard = null;
    Control.hoveredLink = null;
    Control.command = null;
    Control.attacker = null;
    Control.defender = null;
    Control.movingCard = null;
    Control_1.Control = Control;
    class Attack {
        static clear() {
            this._attacker = null;
            this._defender = null;
        }
        static setAttacker(a) {
            this._attacker = a;
        }
        static setDefender(d) {
            this._defender = d;
        }
        static get attacker() {
            return Attack._attacker;
        }
        static get defender() {
            return Attack._defender;
        }
    }
    Control_1.Attack = Attack;
    class Turn {
        static initTurn(factionIndex) {
            Turn.factionIndex = factionIndex;
            Turn.factionShownIndex = factionIndex;
            Turn.hasActed = [];
            Turn.hasActedTwice = [];
            Turn.actionsTaken = 0;
            Turn.faction.collectIncome();
        }
        static nextTurn() {
            Turn.initTurn((Turn.factionIndex + 1) % Model.Model.factions.length);
            // should be at least 2 open cards
            while (Model.Deck.openCards.length < 2) {
                let card = Model.Deck.drawGroup();
                if (card) {
                    card.cardLocation = Model.CardLocation.open;
                }
                else {
                    break;
                }
            }
            // then draw a card
            Model.Deck.drawPlot().cardLocation = Model.CardLocation.open;
        }
        static getHasActed(group) {
            return Turn.hasActed.indexOf(group) > -1;
        }
        static getHasActedTwice(group) {
            return Turn.hasActedTwice.indexOf(group) > -1;
        }
        static setHasActed(group) {
            Turn.hasActed.push(group);
            Turn.actionsTaken++;
        }
        static setHasActedTwice(group) {
            Turn.hasActedTwice.push(group);
        }
        static get faction() {
            return Model.Model.factions[Turn.factionIndex];
        }
        static get factionShown() {
            return Model.Model.factions[Turn.factionShownIndex];
        }
    }
    Turn.actionsTaken = 0;
    Control_1.Turn = Turn;
})(Control || (Control = {}));
window.addEventListener('load', function () {
    Control.Control.init();
    window.addEventListener('mousemove', function (event) {
        Control.Control.onMouseMove(event);
    });
    window.addEventListener('mousedown', function (event) {
        Control.Control.onMouseDown(event);
    });
    window.addEventListener('mouseup', function (event) {
        Control.Control.onMouseUp(event);
    });
    window.addEventListener('mouseout', function (event) {
        Control.Control.onMouseOut(event);
    });
});
