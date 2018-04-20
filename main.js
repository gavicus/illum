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
                card.income = parseInt(income);
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
            console.log('Model.getLinkTargets');
            console.log('movingCard', movingCard);
            console.log('cardSet', cardSet);
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
                for (let index = 0; index < card.links.length; ++index) {
                    if (card.links[index] !== 1) {
                        continue;
                    }
                    targets.push(new LinkTarget(card.shape.links[index], card, index));
                }
            }
            console.log('targets', targets);
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
            this.textAlign = 'center';
            Button.size = new Util.Point(80, 18);
            this.rect = new Util.Rectangle(ulCorner.x, ulCorner.y, Button.size.x, Button.size.y);
            this.textPoint = this.rect.center;
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
    }
    Button.colors = {
        fill: '#efefef',
        border: '#ccc',
        text: 'gray',
        hoveredFill: 'gray',
        hoveredText: 'orange',
        selectedFill: '#ccf',
    };
    View_1.Button = Button;
    // TODO: move faction view buttons from View to PageView
    class View {
        static init(controlCallback, turnObj) {
            View.callback = controlCallback;
            View.turnObject = turnObj;
            View.screenState = State.table;
            View.canvas = document.getElementById('canvas');
            View.context = View.canvas.getContext('2d');
            View.focus = new Util.Point(View.canvas.width / 2, View.canvas.height / 2);
            View.detailButtons = [
                new Button('move', View.callback('btnMoveGroup'), new Util.Point(20, 100)),
                new Button('attack', View.callback('btnAttack'), new Util.Point(100, 100)),
            ];
            // faction selection buttons
            View.factionButtons = [];
            let cursor = new Util.Point(10, View.canvas.height - 10);
            for (let i = Model.Model.factions.length - 1; i >= 0; --i) {
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
        static dragFocus(delta) {
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
        static drawDetail(card, mouse = null) {
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
            if (card.aid > 0) {
                atk += '/' + card.aid;
            }
            let def = card.defense;
            View.context.fillText('attack: ' + atk + '  defense: ' + def, cursor.x, cursor.y);
            cursor.movey(lineHeight);
            View.context.fillText('income: ' + card.income, cursor.x, cursor.y);
            // description
            cursor.movey(lineHeight);
            View.context.fillText(card.description, cursor.x, cursor.y);
            // children
            cursor.movey(lineHeight * 2);
            View.context.fillText('children', cursor.x, cursor.y);
            cursor.movey(lineHeight);
            View.context.font = View.font;
            let children = card.children.map((child) => { return child.name; }).join(', ') || 'none';
            View.context.fillText(children, cursor.x, cursor.y);
            // TODO: buttons: move, attack, etc.
            cursor.movey(lineHeight * 2);
            View.hoveredButton = null;
            for (let btn of View.detailButtons) {
                if (btn.caption === 'move') {
                    if (card.cardType === Model.CardType.root) {
                        continue;
                    } // make root immobile
                    if (card.cardLocation === Model.CardLocation.open) {
                        continue;
                    } // make uncontrolled cards immobile
                }
                else if (btn.caption === 'attack') {
                    if (card.cardLocation !== Model.CardLocation.structure) {
                        continue;
                    }
                    if (card.faction !== View.turnObject.faction) {
                        continue;
                    }
                    // TODO: allow for groups that can act twice
                    if (View.turnObject.getHasActed(card)) {
                        continue;
                    }
                }
                btn.moveTo(cursor);
                let hovered = (mouse && btn.rect.contains(mouse));
                if (hovered) {
                    View.hoveredButton = btn;
                }
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
                cursor.movex(Button.size.x + gutter);
            }
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
                case State.attackSetup: PageAttack.onMouseMove(mouse);
                case State.table: PageTable.onMouseMove(mouse);
            }
        }
        static onMouseClick(mouse) {
            switch (this.screenState) {
                case State.attackSetup: PageAttack.onMouseClick(mouse);
                case State.table: PageTable.onMouseClick(mouse);
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
    // TODO: [execute] should keep us on attack setup page until [done] is clicked
    class PageAttack {
        static init(atkCallback) {
            PageAttack.callback = atkCallback;
            this.reset();
            let lineHeight = 22;
            let cursor = new Util.Point(0, 0);
            // attack type
            cursor.set(View.canvas.width - Button.size.x - 10, 10);
            let cmd1 = new Button('control', PageAttack.btnAtkType, new Util.Point(cursor.x, cursor.y));
            cursor.movey(lineHeight);
            let cmd2 = new Button('neutralize', PageAttack.btnAtkType, new Util.Point(cursor.x, cursor.y));
            cursor.movey(lineHeight);
            let cmd3 = new Button('destroy', PageAttack.btnAtkType, new Util.Point(cursor.x, cursor.y));
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
            this.buttons.push(new Button('more', PageAttack.btnOwnCashMore, cursor));
            this.buttons.push(new Button('less', PageAttack.btnOwnCashLess, cursor.shifted(Button.size.x + 5, 0)));
            cursor.movey(lineHeight * 2);
            let rootMore = new Button('more', PageAttack.btnRootCashMore, cursor);
            let rootLess = new Button('less', PageAttack.btnRootCashLess, cursor.shifted(Button.size.x + 5, 0));
            this.buttons.push(rootMore, rootLess);
            // exec & cancel
            cursor.movey(lineHeight * 2);
            this.buttons.push(new Button('execute', PageAttack.btnExecuteAttack, cursor));
            this.buttons.push(new Button('cancel', PageAttack.btnCancelAttack, cursor.shifted(Button.size.x + 5, 0)));
        }
        static btnOwnCashMore(btn) { }
        static btnOwnCashLess(btn) { }
        static btnRootCashMore(btn) { }
        static btnRootCashLess(btn) { }
        static reset() {
            PageAttack.state = AttackState.setup;
            PageAttack.roll = 0;
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
            let defenseAttribute = defender.defense;
            if (PageAttack.attackType === 'destroy') {
                defenseAttribute = defender.attack;
            }
            // TODO: compute target proximity to root card
            // TODO: allow use of cash
            // TODO: disallow control attacks if attacker has no open out links
            // TODO: figure in card special abilities
            // TODO: newly-controlled cards get their cash halved
            let cursor = new Util.Point(leftMargin, lineHeight);
            ctx.fillStyle = CardView.colors.card.text;
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
            let defLine = 'defender: ' + defender.name + ' (' + defenseAttribute + ')';
            defLine += ' (' + defender.alignments + ')';
            ctx.fillText(defLine, cursor.x, cursor.y);
            // compute totals
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
            let totalAtk = attacker.attack + alignBonus;
            let totalDef = defenseAttribute;
            // show totals
            cursor.movey(lineHeight * 2);
            let cursor2 = cursor.clone();
            ctx.fillText('total attack: ' + totalAtk, cursor.x, cursor.y);
            cursor.movey(lineHeight);
            ctx.fillText('total defense: ' + totalDef, cursor.x, cursor.y);
            cursor.movey(lineHeight);
            ctx.fillText('roll needed: ' + (totalAtk - totalDef) + ' or less', cursor.x, cursor.y);
            // show bonuses
            cursor2.movex(120);
            ctx.fillText('alignment bonus: ' + alignBonus, cursor2.x, cursor2.y);
            cursor2.movey(lineHeight);
            ctx.fillText('illuminati defense: ' + 0, cursor2.x, cursor2.y); // TODO
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
            // buttons
            for (let btn of this.buttons) {
                btn.draw(ctx, btn === this.hoveredButton);
            }
        }
        // accessors
        static get attackTotal() { return PageAttack.callback({ command: 'getAttacker' }).attack; }
        static get defenseTotal() { return PageAttack.callback({ command: 'getDefender' }).defense; }
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
            // TODO: spend cash used in attack
            PageAttack.callback({ command: 'attackerDone' });
            PageAttack.roll = Util.randomInt(1, 6) + Util.randomInt(1, 6);
            let needed = PageAttack.attackTotal - PageAttack.defenseTotal;
            if (needed > 10) {
                needed = 10;
            }
            // let needed = 12; // testing
            if (PageAttack.roll <= needed) {
                PageAttack.state = AttackState.success;
            }
            else {
                PageAttack.state = AttackState.failure;
            }
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
    PageAttack.roll = 0;
    View_1.PageAttack = PageAttack;
    class PageTable {
        static init(callback) {
            PageTable.callback = callback;
            PageTable.state = TableState.normal;
            let cursor = new Util.Point(View.canvas.width - Button.size.x, View.canvas.height - PageTable.footerHeight);
            cursor.move(-10, 10);
            PageTable.buttons.push(new Button('end turn', PageTable.callback({ command: 'btnEndTurn' }), cursor));
        }
        static get footerHeight() { return View.cardLength * 1.4; }
        static draw(ctx) {
            // structure
            let faction = View.turnObject.factionShown;
            CardView.orient(faction.root, faction.root.shape.rootPoint.plus(View.focus), 0);
            // View.drawCard(faction.root);
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
            for (let btn of View.factionButtons) {
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
            // hovered
            if (PageTable.state === TableState.chooseLink) {
            }
            else if (View.hoveredCard) {
                CardView.drawHovered(View.hoveredCard, ctx);
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
        static onMouseMove(mouse) {
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
                let hovered = Model.Model.getHoveredCard(mouse, Model.Deck.tableCards);
                if (hovered !== View.hoveredCard) {
                    View.hoveredCard = hovered;
                    dirty = true;
                }
                let btn = View.getHoveredButton(View.factionButtons.concat(PageTable.buttons), mouse);
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
            if (PageTable.state === TableState.chooseLink) {
                // TODO: check for card overlap
                if (PageTable.hoveredLink) {
                    let defender = PageAttack.callback({ command: 'getDefender' });
                    defender.decouple();
                    PageTable.hoveredLink.card.addCard(defender, PageTable.hoveredLink.linkIndex);
                    PageTable.callback({ command: 'clearCommand' });
                    PageTable.state = TableState.normal;
                    View.canvas.style.cursor = 'arrow';
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
                    View.drawDetail(View.hoveredCard, mouse);
                }
            }
        }
    }
    PageTable.hoveredLink = null;
    PageTable.buttons = [];
    // TODO: handle own input events -- faction view buttons
    PageTable.colors = {
        headerFill: '#eee',
    };
    View_1.PageTable = PageTable;
})(View || (View = {}));
var Control;
(function (Control_1) {
    let Command;
    (function (Command) {
        Command[Command["none"] = 0] = "none";
        Command[Command["placeCard"] = 1] = "placeCard";
        Command[Command["attack"] = 2] = "attack";
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
            View.View.drawPage();
            this.mouse = {
                down: false,
                drag: false,
                last: null,
            };
        }
        static viewCallback(command) {
            switch (command) {
                case 'btnMoveGroup': return Control.btnMoveGroup;
                case 'btnAttack': return Control.btnAttack;
                case 'btnShowFaction': return Control.btnShowFaction;
            }
        }
        static attackCallback(data) {
            switch (data.command) {
                case 'attackerDone': Turn.setHasActed(Attack.attacker);
                case 'cancelAttack': Control.cancelAttack();
                case 'controlSuccess': Control.controlSuccess();
                case 'neutralizeSuccess': Control.neutralizeSuccess();
                case 'destroySuccess': Control.destroySuccess();
                case 'getDefender': return Attack.defender;
                case 'getAttacker': return Attack.attacker;
            }
        }
        static tableCallback(data) {
            switch (data.command) {
                case 'commandIsAttack': return Control.command == Command.attack;
                case 'setDefender':
                    Attack.setDefender(data.value);
                    console.log('setDefender attacker', Attack.attacker);
                case 'clearCommand': this.command = Command.none;
                case 'btnEndTurn': return Control.btnEndTurn;
            }
        }
        static beginChooseLink(cardToPlace, cardSet = Model.Deck.structureCards) {
            // TODO: show somehow that the "hovered" card is getting moved (gray out or attach to mouse)
            View.View.screenState = View.State.table;
            View.PageTable.state = View.TableState.chooseLink;
            View.PageTable.linkTargets = Model.Model.getLinkTargets(cardToPlace, cardSet);
            View.View.drawPage();
        }
        static beginChooseTarget() {
            View.View.screenState = View.State.table;
            View.View.canvas.style.cursor = 'crosshair';
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
            if (View.View.screenState === View.State.detail) {
                View.View.drawDetail(View.View.hoveredCard, mouse);
            }
            else {
                View.View.onMouseMove(mouse);
            }
            this.mouse.last = mouse;
        }
        static onMouseOut(event) {
            this.mouse.down = false;
            this.mouse.drag = false;
        }
        static onMouseUp(event) {
            Control.mouse.drag = false;
            let mouse = new Util.Point(event.offsetX, event.offsetY);
            if (View.View.screenState === View.State.detail) {
                // TODO: buttons, options, etc.
                if (View.View.hoveredButton) {
                    View.View.hoveredButton.callback(View.View.hoveredButton);
                }
                else {
                    View.View.screenState = View.State.table;
                    View.View.drawPage();
                }
            }
            else {
                if (this.mouse.drag) { }
                else {
                    View.View.onMouseClick(mouse);
                }
            }
            this.mouse.down = false;
            this.mouse.drag = false;
        }
        static btnAttack(button) {
            Attack.setAttacker(View.View.hoveredCard);
            Control.command = Command.attack;
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
            Turn.faction.collectIncome();
        }
        static nextTurn() {
            Turn.initTurn((Turn.factionIndex + 1) % Model.Model.factions.length);
        }
        static getHasActed(group) {
            return Turn.hasActed.indexOf(group) > -1;
        }
        static getHasActedTwice(group) {
            return Turn.hasActedTwice.indexOf(group) > -1;
        }
        static setHasActed(group) {
            Turn.hasActed.push(group);
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
