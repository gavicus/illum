var Util;
(function (Util) {
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    Util.randomInt = randomInt;
    var Point = /** @class */ (function () {
        function Point(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        Point.prototype.add = function (p) {
            this.move(p.x, p.y);
        };
        Point.prototype.clone = function () { return new Point(this.x, this.y); };
        Point.prototype.copy = function (p) {
            this.x = p.x;
            this.y = p.y;
        };
        Point.prototype.distSquared = function (p) {
            return Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2);
        };
        Point.prototype.dividedBy = function (n) {
            return new Point(this.x / n, this.y / n);
        };
        Point.prototype.times = function (m) {
            return new Point(this.x * m, this.y * m);
        };
        Point.prototype.equals = function (p) {
            return this.x === p.x && this.y === p.y;
        };
        Point.prototype.floor = function () {
            return new Point(Math.floor(this.x), Math.floor(this.y));
        };
        Point.prototype.minus = function (p) {
            return new Point(this.x - p.x, this.y - p.y);
        };
        Point.prototype.move = function (dx, dy) {
            this.movex(dx);
            this.movey(dy);
        };
        Point.prototype.movex = function (d) { this.x += d; };
        Point.prototype.movey = function (d) { this.y += d; };
        Object.defineProperty(Point.prototype, "negative", {
            get: function () {
                return new Point(-this.x, -this.y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "normal", {
            get: function () {
                return new Point((this.x === 0) ? 0 : this.x / Math.abs(this.x), (this.y === 0) ? 0 : this.y / Math.abs(this.y));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "switched", {
            get: function () {
                return new Point(this.y, this.x);
            },
            enumerable: true,
            configurable: true
        });
        Point.prototype.plus = function (p) {
            return new Point(this.x + p.x, this.y + p.y);
        };
        Point.prototype.set = function (x, y) {
            this.x = x;
            this.y = y;
        };
        Point.prototype.toString = function () {
            return '(' + this.x + ', ' + this.y + ')';
        };
        return Point;
    }());
    Util.Point = Point;
    var Rectangle = /** @class */ (function () {
        function Rectangle(x, y, w, h) {
            this.set(x, y, w, h);
        }
        Rectangle.prototype.set = function (x, y, w, h) {
            this.upperLeft = new Point(x, y);
            this.lowerRight = new Point(x + w, y + h);
        };
        Rectangle.prototype.contains = function (p) {
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
        };
        Object.defineProperty(Rectangle.prototype, "center", {
            get: function () {
                return new Point(this.upperLeft.x + (this.lowerRight.x - this.upperLeft.x) / 2, this.upperLeft.y + (this.lowerRight.y - this.upperLeft.y) / 2);
            },
            enumerable: true,
            configurable: true
        });
        return Rectangle;
    }());
    Util.Rectangle = Rectangle;
})(Util || (Util = {}));
var Model;
(function (Model_1) {
    var CardLocation;
    (function (CardLocation) {
        CardLocation[CardLocation["deck"] = 0] = "deck";
        CardLocation[CardLocation["hand"] = 1] = "hand";
        CardLocation[CardLocation["open"] = 2] = "open";
        CardLocation[CardLocation["structure"] = 3] = "structure";
        CardLocation[CardLocation["discard"] = 4] = "discard";
    })(CardLocation = Model_1.CardLocation || (Model_1.CardLocation = {}));
    ;
    var CardType;
    (function (CardType) {
        CardType[CardType["root"] = 0] = "root";
        CardType[CardType["group"] = 1] = "group";
        CardType[CardType["special"] = 2] = "special";
    })(CardType = Model_1.CardType || (Model_1.CardType = {}));
    ;
    var Align;
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
    var Alignment = /** @class */ (function () {
        function Alignment() {
        }
        Alignment.init = function () {
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
        };
        Alignment.getIndex = function (name) {
            for (var i = 0; i < Alignment.data.length; ++i) {
                if (Alignment.data[i].name.toLowerCase() === name.toLowerCase()) {
                    return i;
                }
            }
        };
        Alignment.getName = function (index) {
            return Alignment.data[index];
        };
        Alignment.getOpposite = function (index) {
            return Alignment.data[index].opp;
        };
        Alignment.compare = function (first, second) {
            var result = { same: 0, opposite: 0 };
            if (!first)
                return result;
            for (var _i = 0, first_1 = first; _i < first_1.length; _i++) {
                var fa = first_1[_i];
                for (var _a = 0, second_1 = second; _a < second_1.length; _a++) {
                    var sa = second_1[_a];
                    var fi = this.getIndex(fa);
                    var si = this.getIndex(sa);
                    if (this.data[fi].opp === si) {
                        result.opposite++;
                    }
                    else if (fi === si) {
                        result.same++;
                    }
                }
            }
            return result;
        };
        Alignment.data = [];
        return Alignment;
    }());
    Model_1.Alignment = Alignment;
    var Faction = /** @class */ (function () {
        function Faction() {
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
        Faction.prototype.collectIncome = function () {
            this.root.collectIncome();
        };
        return Faction;
    }());
    Model_1.Faction = Faction;
    var Card = /** @class */ (function () {
        function Card(name, links) {
            if (links === void 0) { links = 4; }
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
        Object.defineProperty(Card.prototype, "children", {
            get: function () {
                var children = [];
                for (var _i = 0, _a = this.links; _i < _a.length; _i++) {
                    var link = _a[_i];
                    if (typeof link !== 'number') {
                        children.push(link);
                    }
                }
                return children;
            },
            enumerable: true,
            configurable: true
        });
        Card.prototype.addCard = function (card, link) {
            if (this.links[link] !== 1) {
                return false;
            }
            this.links[link] = card;
            card.parent = this;
            card.faction = this.faction;
            return true;
        };
        Card.prototype.collectIncome = function () {
            this.cash += this.income;
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var child = _a[_i];
                child.collectIncome();
            }
        };
        Card.prototype.decouple = function () {
            if (!this.parent) {
                return;
            }
            for (var dir in Object.keys(this.parent.links)) {
                if (typeof this.parent.links[dir] !== 'number' && this.parent.links[dir] === this) {
                    this.parent.links[dir] = 1;
                    this.parent = null;
                    return;
                }
            }
            throw new Error('error decoupling child node');
        };
        Card.prototype.getChildDirection = function (child) {
            for (var dir in Object.keys(this.links)) {
                if (typeof this.links[dir] !== 'number' && this.links[dir] === child) {
                    return dir;
                }
            }
            return null;
        };
        Card.prototype.isDescendantOf = function (card) {
            var cursor = this.parent;
            while (cursor) {
                if (cursor === card) {
                    return true;
                }
                cursor = cursor.parent;
            }
            return false;
        };
        Card.init = function (text) {
            var fields = text.split("|");
            var _a = text.split("|"), type = _a[0], name = _a[1], description = _a[2], atk = _a[3], def = _a[4], links = _a[5], income = _a[6], alignments = _a[7], objective = _a[8];
            var card = new Card(name, parseInt(links));
            card.description = description;
            card.cardLocation = CardLocation.deck;
            if (type !== 'special') {
                var _b = atk.split("/"), attack = _b[0], aid = _b[1];
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
        };
        return Card;
    }());
    Model_1.Card = Card;
    var Deck = /** @class */ (function () {
        function Deck() {
        }
        Deck.init = function () {
            for (var _i = 0, _a = Deck.library; _i < _a.length; _i++) {
                var text = _a[_i];
                Deck.cards.push(Card.init(text));
            }
        };
        Deck.drawCard = function (collection, filter) {
            var available = collection.filter(function (card) {
                if (card.cardLocation !== CardLocation.deck) {
                    return false;
                }
                return filter(card);
            });
            var draw = available[Util.randomInt(0, available.length - 1)];
            draw.cardLocation = CardLocation.structure;
            return draw;
        };
        Deck.drawRoot = function () {
            return Deck.drawCard(Deck.cards, function (card) { return card.cardType === CardType.root; });
        };
        Deck.drawPlot = function () {
            return Deck.drawCard(Deck.cards, function (card) { return card.cardType !== CardType.root; });
        };
        Deck.drawGroup = function () {
            return Deck.drawCard(Deck.cards, function (card) { return card.cardType === CardType.group; });
        };
        Object.defineProperty(Deck, "structureCards", {
            get: function () {
                return Deck.cards.filter(function (card) {
                    return card.cardLocation === CardLocation.structure
                        && card.faction === Control.Turn.factionShown;
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Deck, "tableCards", {
            get: function () {
                return Deck.openCards.concat(Deck.structureCards);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Deck, "openCards", {
            get: function () {
                return Deck.cards.filter(function (card) { return card.cardLocation === CardLocation.open; });
            },
            enumerable: true,
            configurable: true
        });
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
        return Deck;
    }());
    Model_1.Deck = Deck;
    var LinkTarget = /** @class */ (function () {
        function LinkTarget(point, card, linkIndex) {
            this.point = point;
            this.card = card;
            this.linkIndex = linkIndex;
        }
        return LinkTarget;
    }());
    Model_1.LinkTarget = LinkTarget;
    var Model = /** @class */ (function () {
        function Model() {
        }
        Model.getHoveredCard = function (mouse, cardSet) {
            if (cardSet === void 0) { cardSet = Deck.tableCards; }
            for (var _i = 0, cardSet_1 = cardSet; _i < cardSet_1.length; _i++) {
                var card = cardSet_1[_i];
                if (card.shape.rect.contains(mouse)) {
                    return card;
                }
            }
            return null;
        };
        Model.newCard = function (faction, name, links) {
            var card = new Card(name, links);
            card.faction = faction;
            return card;
        };
        Model.getLinkTargets = function (movingCard, cardSet) {
            if (cardSet === void 0) { cardSet = Deck.structureCards; }
            console.log('Model.getLinkTargets');
            console.log('movingCard', movingCard);
            console.log('cardSet', cardSet);
            var faction = movingCard.faction;
            var targets = [];
            for (var _i = 0, cardSet_2 = cardSet; _i < cardSet_2.length; _i++) {
                var card = cardSet_2[_i];
                if (card.faction !== faction) {
                    continue;
                }
                if (card === movingCard) {
                    continue;
                }
                if (card.isDescendantOf(movingCard)) {
                    continue;
                }
                for (var index = 0; index < card.links.length; ++index) {
                    if (card.links[index] !== 1) {
                        continue;
                    }
                    targets.push(new LinkTarget(card.shape.links[index], card, index));
                }
            }
            console.log('targets', targets);
            return targets;
        };
        Model.initFactions = function (quantity) {
            for (var i = 0; i < quantity; ++i) {
                Model.factions.push(new Faction());
            }
        };
        Model.factions = [];
        return Model;
    }());
    Model_1.Model = Model;
})(Model || (Model = {}));
var View;
(function (View_1) {
    var State;
    (function (State) {
        State[State["table"] = 0] = "table";
        State[State["detail"] = 1] = "detail";
        State[State["choice"] = 2] = "choice";
        State[State["chooseLink"] = 3] = "chooseLink";
        State[State["attackSetup"] = 4] = "attackSetup";
    })(State = View_1.State || (View_1.State = {}));
    ;
    var AttackState;
    (function (AttackState) {
        AttackState[AttackState["setup"] = 0] = "setup";
        AttackState[AttackState["success"] = 1] = "success";
        AttackState[AttackState["failure"] = 2] = "failure";
    })(AttackState = View_1.AttackState || (View_1.AttackState = {}));
    ;
    var CardShape = /** @class */ (function () {
        function CardShape() {
        }
        CardShape.draw = function (card) {
            // orient called before draw
            CardShape.drawBorder(card);
        };
        CardShape.drawBorder = function (card) {
            this.drawRoundRect(card.shape.rect, View.getArcSize());
        };
        CardShape.drawRoundRect = function (rect, cornerSize) {
            var deltax = new Util.Point(cornerSize, 0);
            var deltay = new Util.Point(0, cornerSize);
            var corner = rect.upperLeft.clone();
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
        };
        CardShape.drawLink = function (apex, center, inward) {
            var left = apex.clone();
            var right = apex.clone();
            var arrowSize = View.cardLength * CardShape.arrowSize;
            var toCenter = center.minus(apex).normal.times(arrowSize);
            var toSide = toCenter.switched.dividedBy(2);
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
        };
        CardShape.orient = function (card, stem, direction) {
            // stem point already shifted by focus
            // cardLength already determined from view
            card.shape.stem.copy(stem);
            card.shape.links[0].copy(stem);
            card.shape.links[1].copy(stem);
            card.shape.links[2].copy(stem);
            card.shape.links[3].copy(stem);
            card.shape.rotation = direction;
            var cardWidth = View.cardLength * View.widthRatio;
            var x, y, w, h;
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
        };
        CardShape.arrowSize = 0.1;
        CardShape.cornerSize = 0.15;
        return CardShape;
    }());
    View_1.CardShape = CardShape;
    var Button = /** @class */ (function () {
        function Button(caption, callback, ulCorner) {
            this.caption = caption;
            this.callback = callback;
            this.ulCorner = ulCorner;
            this.font = View.boldFont;
            this.outline = true;
            this.selected = false;
            this.visible = true;
            this.textAlign = 'center';
            Button.size = new Util.Point(80, 18);
            this.rect = new Util.Rectangle(ulCorner.x, ulCorner.y, Button.size.x, Button.size.y);
            this.textPoint = this.rect.center;
        }
        Button.getHoveredButton = function (buttonSet, mouse) {
            for (var _i = 0, buttonSet_1 = buttonSet; _i < buttonSet_1.length; _i++) {
                var btn = buttonSet_1[_i];
                if (btn.hovered(mouse)) {
                    return btn;
                }
            }
            return null;
        };
        Button.prototype.draw = function (c, hovered) {
            if (!this.visible) {
                return;
            }
            if (this.outline) {
                CardShape.drawRoundRect(this.rect, 10);
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
        };
        Button.prototype.hovered = function (mouse) {
            return this.rect.contains(mouse);
        };
        Button.prototype.moveTo = function (point) {
            var dims = this.rect.lowerRight.minus(this.rect.upperLeft);
            this.rect.upperLeft.copy(point);
            this.rect.lowerRight.copy(point.plus(dims));
        };
        Button.colors = {
            fill: '#efefef',
            border: '#ccc',
            text: 'gray',
            hoveredFill: 'gray',
            hoveredText: 'orange',
            selectedFill: '#ccf',
        };
        return Button;
    }());
    View_1.Button = Button;
    var View = /** @class */ (function () {
        function View() {
        }
        View.init = function (controlCallback, turnObj) {
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
            var cursor = new Util.Point(10, View.canvas.height - 10);
            for (var i = Model.Model.factions.length - 1; i >= 0; --i) {
                var faction = Model.Model.factions[i];
                var btn = new Button(faction.root.name, View.callback('btnShowFaction'), cursor.clone());
                btn.data = faction;
                btn.outline = false;
                btn.textPoint = cursor.clone();
                btn.textAlign = 'left';
                btn.data = faction;
                View.factionButtons.push(btn);
                cursor.movey(-14);
            }
            this.orientRootCards(Model.Model.factions);
            this.draw();
        };
        View.dragFocus = function (delta) {
            View.focus.move(delta.x, delta.y);
        };
        View.draw = function () {
            this.clear();
            // structure
            var faction = View.turnObject.factionShown;
            CardShape.orient(faction.root, faction.root.shape.rootPoint.plus(View.focus), 0);
            this.drawCard(faction.root);
            // header: uncontrolled
            View.context.fillStyle = View.colors.screen.headerFill;
            View.context.fillRect(0, 0, View.canvas.width, View.cardLength * 1.4);
            var open = Model.Deck.openCards;
            var cursor = new Util.Point(View.cardLength / 2, 10);
            for (var _i = 0, open_1 = open; _i < open_1.length; _i++) {
                var card = open_1[_i];
                CardShape.orient(card, cursor, 1);
                View.drawCard(card);
                cursor.movex(View.cardLength);
            }
            // footer: faction selection, hand, buttons
            var height = View.cardLength * 1.4;
            View.context.fillStyle = View.colors.screen.headerFill;
            View.context.fillRect(0, View.canvas.height - height, View.canvas.width, height);
            // faction selection
            for (var _a = 0, _b = View.factionButtons; _a < _b.length; _a++) {
                var btn = _b[_a];
                if (btn.data === View.turnObject.faction) {
                    btn.font = View.boldFont;
                }
                else {
                    btn.font = View.font;
                }
                btn.draw(View.context, btn === View.hoveredButton);
            }
            // hovered
            if (View.hoveredCard) {
                CardShape.drawBorder(View.hoveredCard);
                View.context.strokeStyle = View.colors.card.hoveredBorder;
                View.context.stroke();
            }
        };
        View.drawLinkChoice = function (closest) {
            View.draw();
            if (!closest) {
                return;
            }
            View.beginPath();
            View.context.arc(closest.point.x, closest.point.y, View.getArcSize(), 0, 2 * Math.PI, false);
            View.context.strokeStyle = 'red';
            View.context.stroke();
        };
        View.drawDetail = function (card, mouse) {
            // TODO:
            // long description lines must wrap (see IRS)
            // IRS income shows as NaN -- make exceptions for special cases
            if (mouse === void 0) { mouse = null; }
            View.clear();
            var gutter = 20;
            var lineHeight = 16;
            var cursor = new Util.Point(gutter, gutter);
            // name
            View.context.font = View.boldFont;
            View.context.fillStyle = View.colors.card.text;
            View.context.textAlign = 'left';
            View.context.textBaseline = 'alphabetic';
            var cardName = card.name;
            if (card.cardType === Model.CardType.root) {
                cardName = 'The ' + card.name;
            }
            View.context.fillText(cardName, cursor.x, cursor.y);
            cursor.movey(lineHeight);
            View.context.fillText('(' + card.alignments + ')', cursor.x, cursor.y);
            // numbers
            cursor.movey(lineHeight);
            View.context.font = View.font;
            var atk = '' + card.attack;
            if (card.aid > 0) {
                atk += '/' + card.aid;
            }
            var def = card.defense;
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
            var children = card.children.map(function (child) { return child.name; }).join(', ') || 'none';
            View.context.fillText(children, cursor.x, cursor.y);
            // TODO: buttons: move, attack, etc.
            cursor.movey(lineHeight * 2);
            View.hoveredButton = null;
            for (var _i = 0, _a = View.detailButtons; _i < _a.length; _i++) {
                var btn = _a[_i];
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
                var hovered = (mouse && btn.rect.contains(mouse));
                if (hovered) {
                    View.hoveredButton = btn;
                }
                CardShape.drawRoundRect(btn.rect, 10);
                View.context.fillStyle = hovered ? Button.colors.hoveredFill : Button.colors.fill;
                View.context.fill();
                View.context.strokeStyle = Button.colors.border;
                View.context.stroke();
                View.context.font = View.boldFont;
                View.context.fillStyle = hovered ? Button.colors.hoveredText : Button.colors.text;
                View.context.textAlign = 'center';
                View.context.textBaseline = 'middle';
                var center = btn.rect.center;
                View.context.fillText(btn.caption, center.x, center.y);
                cursor.movex(Button.size.x + gutter);
            }
        };
        View.clear = function () {
            var w = View.canvas.width;
            var h = View.canvas.height;
            var c = View.context;
            c.fillStyle = View.colors.screen.fill;
            c.fillRect(0, 0, w, h);
        };
        View.drawCard = function (card) {
            var _this = this;
            CardShape.drawBorder(card);
            if (card.cardType === Model.CardType.group) {
                View.context.fillStyle = View.colors.card.fill;
            }
            else {
                View.context.fillStyle = View.colors.rootCard.fill;
            }
            View.context.strokeStyle = View.colors.card.border;
            View.context.fill();
            View.context.stroke();
            // draw the links
            for (var index = 0; index < card.links.length; ++index) {
                var inward = false;
                if (card.links[index] === 0) {
                    if (index === 0) {
                        inward = true;
                    }
                    else {
                        continue;
                    }
                }
                var apex = card.shape.links[index].clone();
                var center_1 = card.shape.rect.center;
                CardShape.drawLink(apex, center_1, inward);
                if (card.cardType === Model.CardType.group) {
                    View.context.fillStyle = View.colors.card.link;
                }
                else {
                    View.context.fillStyle = View.colors.rootCard.link;
                }
                View.context.fill();
            }
            // draw has-acted icon
            if (View.turnObject.getHasActed(card)) {
                var center_2 = new Util.Point(card.shape.rect.lowerRight.x, card.shape.rect.upperLeft.y);
                var radius = View.cardLength * CardShape.arrowSize;
                center_2.move(-radius, radius);
                View.context.arc(center_2.x, center_2.y, radius - 2, 0, Math.PI * 2);
                View.context.fillStyle =
                    card.cardType === Model.CardType.group
                        ? View.colors.card.link
                        : View.colors.rootCard.link;
                View.context.fill();
            }
            // draw card name
            var center = card.shape.rect.center;
            if (card.cardType === Model.CardType.group) {
                View.context.fillStyle = View.colors.card.text;
            }
            else {
                View.context.fillStyle = View.colors.rootCard.text;
            }
            View.context.font = View.font;
            View.context.textAlign = 'center';
            View.context.textBaseline = 'middle';
            View.context.fillText(card.name.substring(0, View.cardLength / 8), center.x, center.y);
            // draw card cash
            if (card.cardLocation === Model.CardLocation.structure) {
                var cursor = card.shape.rect.lowerRight.clone();
                cursor.move(-2, -2);
                View.context.textAlign = 'right';
                View.context.textBaseline = 'alphabetic';
                View.context.fillStyle = View.colors.card.cash;
                View.context.fillText('' + card.cash, cursor.x, cursor.y);
            }
            // draw the card's children
            card.links.forEach(function (child, direction) {
                if (typeof child !== 'number') {
                    var childDirection = (card.shape.rotation + direction + 2) % 4;
                    CardShape.orient(child, card.shape.links[direction], childDirection);
                    _this.drawCard(child);
                }
            });
        };
        View.drawPage = function () {
            View.clear();
            if (View.screenState === State.attackSetup) {
                PageAttack.draw(View.context);
            }
        };
        ;
        View.getHoveredButton = function (btnSet, mouse) {
            for (var _i = 0, btnSet_1 = btnSet; _i < btnSet_1.length; _i++) {
                var btn = btnSet_1[_i];
                if (btn.hovered(mouse)) {
                    return btn;
                }
            }
            return null;
        };
        View.orientRootCards = function (factions) {
            factions.forEach(function (faction, index) {
                faction.root.shape.rootPoint = new Util.Point(-View.cardLength / 2, -View.cardLength / 2);
                CardShape.orient(faction.root, faction.root.shape.rootPoint, 0);
            });
        };
        Object.defineProperty(View, "font", {
            get: function () {
                return View.textSize + "px sans-serif";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View, "boldFont", {
            get: function () {
                return "bold " + View.textSize + "px sans-serif";
            },
            enumerable: true,
            configurable: true
        });
        // page events
        View.onMouseMove = function (mouse) {
            if (this.screenState === State.attackSetup) {
                PageAttack.onMouseMove(mouse);
            }
        };
        View.onMouseClick = function (mouse) {
            if (this.screenState === State.attackSetup) {
                PageAttack.onMouseClick(mouse);
            }
        };
        // draw helper functions
        View.beginPath = function () {
            this.context.beginPath();
        };
        View.moveTo = function (p) {
            this.context.moveTo(p.x, p.y);
        };
        View.lineTo = function (p) {
            this.context.lineTo(p.x, p.y);
        };
        View.arcTo = function (p1, p2, rad) {
            if (rad === void 0) { rad = this.getArcSize(); }
            this.context.arcTo(p1.x, p1.y, p2.x, p2.y, rad);
        };
        View.getArcSize = function () {
            return this.arcRadius * this.cardLength;
        };
        View.arcRadius = 0.15;
        View.widthRatio = 0.7;
        View.cardLength = 50; // changes with zoom
        View.hoveredButton = null;
        View.hoveredCard = null;
        View.textSize = 10;
        View.colors = {
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
        return View;
    }());
    View_1.View = View;
    var PageAttack = /** @class */ (function () {
        function PageAttack() {
        }
        PageAttack.init = function (atkObject, atkCallback) {
            PageAttack.attackObject = atkObject;
            PageAttack.attackCallback = atkCallback;
            this.reset();
            var lineHeight = 22;
            var cursor = new Util.Point(10, 150);
            this.buttons.push(new Button('execute', PageAttack.btnExecuteAttack, cursor));
            cursor.movey(lineHeight);
            this.buttons.push(new Button('cancel', PageAttack.btnCancelAttack, cursor));
            cursor.set(View.canvas.width - Button.size.x - 10, 10);
            var cmd1 = new Button('control', PageAttack.btnAtkType, new Util.Point(cursor.x, cursor.y));
            cursor.movey(lineHeight);
            var cmd2 = new Button('neutralize', PageAttack.btnAtkType, new Util.Point(cursor.x, cursor.y));
            cursor.movey(lineHeight);
            var cmd3 = new Button('destroy', PageAttack.btnAtkType, new Util.Point(cursor.x, cursor.y));
            cmd1.selected = true;
            var data = { group: [cmd1, cmd2, cmd3] };
            cmd1.data = data;
            cmd2.data = data;
            cmd3.data = data;
            var done = new Button('done', PageAttack.btnDone, new Util.Point(10, 200));
            done.visible = false;
            this.buttons.push(cmd1, cmd2, cmd3, done);
        };
        PageAttack.reset = function () {
            PageAttack.state = AttackState.setup;
            PageAttack.roll = 0;
            for (var _i = 0, _a = PageAttack.buttons; _i < _a.length; _i++) {
                var btn = _a[_i];
                if (btn.caption === 'done') {
                    btn.visible = false;
                }
                else {
                    btn.visible = true;
                }
            }
        };
        PageAttack.initDoneState = function () {
            for (var _i = 0, _a = PageAttack.buttons; _i < _a.length; _i++) {
                var btn = _a[_i];
                if (btn.caption === 'done') {
                    btn.visible = true;
                }
                else {
                    btn.visible = false;
                }
            }
        };
        Object.defineProperty(PageAttack, "attackTotal", {
            get: function () { return PageAttack.attackObject.attacker.attack; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PageAttack, "defenseTotal", {
            get: function () { return PageAttack.attackObject.defender.defense; },
            enumerable: true,
            configurable: true
        });
        PageAttack.draw = function (ctx) {
            console.log('PageAttack.draw', PageAttack.attackType);
            var leftMargin = 10;
            var lineHeight = 15;
            var defenseAttribute = PageAttack.attackObject.defender.defense;
            if (PageAttack.attackType === 'destroy') {
                defenseAttribute = PageAttack.attackObject.defender.attack;
            }
            // TODO: compute target proximity to root card
            // TODO: allow use of cash
            // TODO: disallow control attacks if attacker has no open out links
            // TODO: figure in card special abilities
            // TODO: newly-controlled cards get their cash halved
            var cursor = new Util.Point(leftMargin, lineHeight);
            ctx.fillStyle = View.colors.card.text;
            ctx.font = View.font;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            var typeLine = 'attack type: ' + PageAttack.attackType;
            ctx.fillText(typeLine, cursor.x, cursor.y);
            cursor.movey(lineHeight);
            var atkLine = 'attacker: ' + PageAttack.attackObject.attacker.name + ' (' + PageAttack.attackObject.attacker.attack + ')';
            atkLine += ' (' + PageAttack.attackObject.attacker.alignments + ')';
            ctx.fillText(atkLine, cursor.x, cursor.y);
            cursor.movey(lineHeight);
            var defLine = 'defender: ' + PageAttack.attackObject.defender.name + ' (' + defenseAttribute + ')';
            defLine += ' (' + PageAttack.attackObject.defender.alignments + ')';
            ctx.fillText(defLine, cursor.x, cursor.y);
            // compute totals
            var comparison = Model.Alignment.compare(PageAttack.attackObject.attacker.alignments, PageAttack.attackObject.defender.alignments);
            var alignBonus = 0;
            if (PageAttack.attackType === 'control') {
                alignBonus = comparison.same * 4 - comparison.opposite * 4;
            }
            else if (PageAttack.attackType === 'neutralize') {
                alignBonus = 6 + comparison.same * 4 - comparison.opposite * 4;
            }
            else if (PageAttack.attackType === 'destroy') {
                alignBonus = comparison.opposite * 4 - comparison.same * 4;
            }
            var totalAtk = PageAttack.attackObject.attacker.attack + alignBonus;
            var totalDef = defenseAttribute;
            // show totals
            cursor.movey(lineHeight * 2);
            var cursor2 = cursor.clone();
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
            for (var _i = 0, _a = this.buttons; _i < _a.length; _i++) {
                var btn = _a[_i];
                btn.draw(ctx, btn === this.hoveredButton);
            }
        };
        // button events
        PageAttack.btnAtkType = function (button) {
            for (var _i = 0, _a = button.data.group; _i < _a.length; _i++) {
                var btn = _a[_i];
                btn.selected = false;
            }
            button.selected = true;
            PageAttack.attackType = button.caption;
            View.drawPage();
        };
        PageAttack.btnExecuteAttack = function (button) {
            // TODO: spend cash used in attack
            PageAttack.attackCallback({ command: 'attackerDone' });
            PageAttack.roll = Util.randomInt(1, 6) + Util.randomInt(1, 6);
            // let needed = PageAttack.attackTotal - PageAttack.defenseTotal;
            var needed = 12; // testing
            if (PageAttack.roll < needed) {
                PageAttack.state = AttackState.success;
            }
            else {
                PageAttack.state = AttackState.failure;
            }
            PageAttack.initDoneState();
            View.drawPage();
        };
        PageAttack.btnCancelAttack = function (button) {
            PageAttack.attackCallback({ command: 'cancelAttack' });
            View.screenState = State.table;
            PageAttack.reset();
            View.draw();
        };
        PageAttack.btnDone = function (button) {
            View.screenState = State.table;
            if (PageAttack.state === AttackState.failure) {
                PageAttack.attackCallback({ command: 'cancelAttack' });
            }
            else if (PageAttack.attackType === 'control') {
                PageAttack.attackCallback({ command: 'controlSuccess' });
            }
            else if (PageAttack.attackType === 'neutralize') {
                PageAttack.attackCallback({ command: 'neutralizeSuccess' });
            }
            else if (PageAttack.attackType === 'destroy') {
                PageAttack.attackCallback({ command: 'destroySuccess' });
            }
            PageAttack.reset();
            View.draw();
        };
        // mouse event
        PageAttack.onMouseMove = function (mouse) {
            var buttonSet = this.buttons.filter(function (btn) { return btn.visible === true; });
            this.hoveredButton = Button.getHoveredButton(buttonSet, mouse);
            View.drawPage();
        };
        PageAttack.onMouseClick = function (mouse) {
            if (this.hoveredButton) {
                this.hoveredButton.callback(this.hoveredButton);
            }
        };
        PageAttack.buttons = [];
        PageAttack.hoveredButton = null;
        PageAttack.attackType = 'control';
        PageAttack.roll = 0;
        return PageAttack;
    }());
    View_1.PageAttack = PageAttack;
})(View || (View = {}));
var Control;
(function (Control_1) {
    var Command;
    (function (Command) {
        Command[Command["none"] = 0] = "none";
        Command[Command["placeCard"] = 1] = "placeCard";
        Command[Command["attack"] = 2] = "attack";
    })(Command = Control_1.Command || (Control_1.Command = {}));
    ;
    var Control = /** @class */ (function () {
        function Control() {
        }
        Control.init = function () {
            Model.Deck.init();
            Model.Model.initFactions(2);
            Model.Alignment.init();
            Turn.initTurn(0);
            for (var i = 0; i < 4; ++i) {
                var card = Model.Deck.drawGroup().cardLocation = Model.CardLocation.open;
            }
            View.View.init(Control.viewCallback, Turn);
            View.PageAttack.init(Attack, Control.attackCallback);
            this.mouse = {
                down: false,
                drag: false,
                last: null,
            };
        };
        Control.viewCallback = function (command) {
            switch (command) {
                case 'btnMoveGroup': return Control.btnMoveGroup;
                case 'btnAttack': return Control.btnAttack;
                case 'btnShowFaction': return Control.btnShowFaction;
            }
        };
        Control.attackCallback = function (data) {
            if (data.command === 'attackerDone') {
                Turn.setHasActed(Attack.attacker);
            }
            else if (data.command === 'cancelAttack') {
                Control.cancelAttack();
            }
            else if (data.command === 'controlSuccess') {
                Control.controlSuccess();
            }
            else if (data.command === 'neutralizeSuccess') {
                Control.neutralizeSuccess();
            }
            else if (data.command === 'destroySuccess') {
                Control.destroySuccess();
            }
        };
        Control.beginChooseLink = function (cardToPlace, cardSet) {
            if (cardSet === void 0) { cardSet = Model.Deck.structureCards; }
            // TODO: show somehow that the "hovered" card is getting moved (gray out or attach to mouse)
            View.View.screenState = View.State.chooseLink;
            this.linkTargets = Model.Model.getLinkTargets(View.View.hoveredCard, cardSet);
            console.log('beginChooseLink');
            console.log('cardToPlace', cardToPlace);
            console.log('cardSet', cardSet);
            console.log('linkTargets', this.linkTargets);
            View.View.draw();
        };
        Control.beginChooseTarget = function () {
            View.View.screenState = View.State.table;
            View.View.canvas.style.cursor = 'crosshair';
            View.View.draw();
        };
        Control.cancelAttack = function () {
            Attack.clear();
            this.command = Command.none;
        };
        Control.restoreTableState = function () {
            View.View.screenState = View.State.table;
            Turn.factionShownIndex = Turn.factionIndex;
            View.View.draw();
        };
        Control.controlSuccess = function () {
            Control.restoreTableState();
            Attack.defender.faction = Attack.attacker.faction;
            Attack.defender.cardLocation = Model.CardLocation.structure;
            Control.beginChooseLink(Attack.defender, [Attack.attacker]);
        };
        Control.neutralizeSuccess = function () {
            Control.restoreTableState();
        };
        Control.destroySuccess = function () {
            Control.restoreTableState();
        };
        Control.onMouseDown = function (event) {
            this.mouse.down = true;
            this.mouse.drag = false;
            this.mouse.last = new Util.Point(event.offsetX, event.offsetY);
        };
        Control.onMouseMove = function (event) {
            var mouse = new Util.Point(event.offsetX, event.offsetY);
            if (this.mouse.down && !mouse.equals(this.mouse.last)) {
                this.mouse.drag = true;
            }
            if (View.View.screenState === View.State.table) {
                var dirty = false;
                if (this.mouse.drag) {
                    var delta = mouse.minus(this.mouse.last);
                    View.View.dragFocus(delta);
                    dirty = true;
                }
                else {
                    var hovered = Model.Model.getHoveredCard(mouse, Model.Deck.tableCards);
                    if (hovered !== View.View.hoveredCard) {
                        View.View.hoveredCard = hovered;
                        dirty = true;
                    }
                    var btn = View.View.getHoveredButton(View.View.factionButtons, mouse);
                    if (btn !== View.View.hoveredButton) {
                        View.View.hoveredButton = btn;
                        dirty = true;
                    }
                }
                if (dirty) {
                    View.View.draw();
                }
            }
            else if (View.View.screenState === View.State.chooseLink) {
                var closest = null;
                var sqDist = 0;
                var minDist = Math.pow(View.View.cardLength, 2);
                for (var _i = 0, _a = this.linkTargets; _i < _a.length; _i++) {
                    var target = _a[_i];
                    var d2 = mouse.distSquared(target.point);
                    if (d2 > minDist) {
                        continue;
                    }
                    if (closest === null || d2 < sqDist) {
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
            else {
                View.View.onMouseMove(mouse);
            }
            this.mouse.last = mouse;
        };
        Control.onMouseOut = function (event) {
            this.mouse.down = false;
            this.mouse.drag = false;
        };
        Control.onMouseUp = function (event) {
            var mouse = new Util.Point(event.offsetX, event.offsetY);
            if (View.View.screenState === View.State.table) {
                if (this.mouse.drag) { }
                else if (View.View.hoveredButton) {
                    View.View.hoveredButton.callback(View.View.hoveredButton);
                }
                else if (View.View.hoveredCard) {
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
                if (this.mouse.drag) { }
                else {
                    View.View.onMouseClick(mouse);
                }
            }
            this.mouse.down = false;
            this.mouse.drag = false;
        };
        Control.btnAttack = function (button) {
            Attack.setAttacker(View.View.hoveredCard);
            Control.command = Command.attack;
            Control.beginChooseTarget();
        };
        Control.btnMoveGroup = function (button) {
            console.log('btnMoveGroup');
        };
        Control.btnShowFaction = function (button) {
            console.log('btnShowFaction', button.data);
            Turn.factionShownIndex = Model.Model.factions.indexOf(button.data);
            View.View.draw();
        };
        Control.hoveredCard = null;
        Control.hoveredLink = null;
        Control.command = null;
        Control.attacker = null;
        Control.defender = null;
        return Control;
    }());
    Control_1.Control = Control;
    var Attack = /** @class */ (function () {
        function Attack() {
        }
        Attack.clear = function () {
            this._attacker = null;
            this._defender = null;
        };
        Attack.setAttacker = function (a) {
            this._attacker = a;
        };
        Attack.setDefender = function (d) {
            this._defender = d;
        };
        Object.defineProperty(Attack, "attacker", {
            get: function () { return Attack._attacker; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Attack, "defender", {
            get: function () { return Attack._defender; },
            enumerable: true,
            configurable: true
        });
        return Attack;
    }());
    Control_1.Attack = Attack;
    var Turn = /** @class */ (function () {
        function Turn() {
        }
        Turn.initTurn = function (factionIndex) {
            Turn.factionIndex = factionIndex;
            Turn.factionShownIndex = factionIndex;
            Turn.hasActed = [];
            Turn.hasActedTwice = [];
            Turn.faction.collectIncome();
        };
        Turn.getHasActed = function (group) {
            return Turn.hasActed.indexOf(group) > -1;
        };
        Turn.getHasActedTwice = function (group) {
            return Turn.hasActedTwice.indexOf(group) > -1;
        };
        Turn.setHasActed = function (group) {
            Turn.hasActed.push(group);
        };
        Turn.setHasActedTwice = function (group) {
            Turn.hasActedTwice.push(group);
        };
        Object.defineProperty(Turn, "faction", {
            get: function () {
                return Model.Model.factions[Turn.factionIndex];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Turn, "factionShown", {
            get: function () {
                return Model.Model.factions[Turn.factionShownIndex];
            },
            enumerable: true,
            configurable: true
        });
        return Turn;
    }());
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
