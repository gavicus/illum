var Util;
(function (Util) {
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    Util.randomInt = randomInt;
    var Point = /** @class */ (function () {
        function Point(px, py) {
            if (px === void 0) { px = 0; }
            if (py === void 0) { py = 0; }
            this.x = px;
            this.y = py;
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
    var Model = /** @class */ (function () {
        function Model() {
        }
        Model.getHoveredCard = function (mouse, cardSet) {
            for (var _i = 0, _a = Deck.tableCards; _i < _a.length; _i++) {
                var card = _a[_i];
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
            var faction = movingCard.faction;
            var targets = [];
            for (var _i = 0, cardSet_1 = cardSet; _i < cardSet_1.length; _i++) {
                var card = cardSet_1[_i];
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
    var LinkTarget = /** @class */ (function () {
        function LinkTarget(point, card, linkIndex) {
            this.point = point;
            this.card = card;
            this.linkIndex = linkIndex;
        }
        return LinkTarget;
    }());
    Model_1.LinkTarget = LinkTarget;
    var Faction = /** @class */ (function () {
        function Faction() {
            this.root = Deck.drawRoot();
            // this.root = Model.newCard(this, 'root', 4);
            // let child = Model.newCard(this, 'child', 3);
            // this.root.addCard(child, 2);
            // let grand = Model.newCard(this, 'grand1', 1);
            // child.addCard(grand,2);
            // let grand2 = Model.newCard(this, 'grand2', 2);
            // child.addCard(grand2,3);
        }
        return Faction;
    }());
    Model_1.Faction = Faction;
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
    var Card = /** @class */ (function () {
        function Card(name, links) {
            if (links === void 0) { links = 4; }
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
            return true;
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
                // card.alignments = alignments;
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
                return Deck.cards.filter(function (card) { return card.cardLocation === CardLocation.structure; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Deck, "tableCards", {
            get: function () {
                return Deck.cards.filter(function (card) {
                    return card.cardLocation === CardLocation.open
                        || card.cardLocation === CardLocation.structure;
                });
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
})(Model || (Model = {}));
var View;
(function (View_1) {
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
    var Button = /** @class */ (function () {
        function Button(caption, ulCorner) {
            this.caption = caption;
            this.ulCorner = ulCorner;
            this.size = new Util.Point(80, 18);
            this.rect = new Util.Rectangle(ulCorner.x, ulCorner.y, this.size.x, this.size.y);
        }
        Button.prototype.hovered = function (mouse) {
            return this.rect.contains(mouse);
        };
        Button.prototype.moveTo = function (point) {
            var dims = this.rect.lowerRight.minus(this.rect.upperLeft);
            this.rect.upperLeft.copy(point);
            this.rect.lowerRight.copy(point.plus(dims));
        };
        return Button;
    }());
    var View = /** @class */ (function () {
        function View() {
        }
        View.init = function () {
            View.canvas = document.getElementById('canvas');
            View.context = View.canvas.getContext('2d');
            View.focus = new Util.Point(View.canvas.width / 2, View.canvas.height / 2);
            View.detailButtons = [
                new Button('move', new Util.Point(20, 100)),
                new Button('control', new Util.Point(100, 100)),
            ];
            this.orientRootCards(Model.Model.factions);
            this.draw();
            console.log('cursor', View.canvas.style.cursor);
        };
        View.dragFocus = function (delta) {
            View.focus.move(delta.x, delta.y);
        };
        View.draw = function () {
            this.clear();
            // structures
            for (var _i = 0, _a = Model.Model.factions; _i < _a.length; _i++) {
                var faction = _a[_i];
                CardShape.orient(faction.root, faction.root.shape.rootPoint.plus(View.focus), 0);
                this.drawCard(faction.root);
            }
            // uncontrolled
            var open = Model.Deck.openCards;
            var cursor = new Util.Point(View.cardLength / 2, 10);
            for (var _b = 0, open_1 = open; _b < open_1.length; _b++) {
                var card = open_1[_b];
                CardShape.orient(card, cursor, 1);
                View.drawCard(card);
                cursor.movex(View.cardLength);
            }
            // hand
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
            // TODO: make root immobile -- hide 'move' button on detail screen
            if (mouse === void 0) { mouse = null; }
            View.clear();
            var gutter = 20;
            var lineHeight = 16;
            var textSize = 10;
            var cursor = new Util.Point(gutter, gutter);
            // name
            var bodyText = textSize + "px sans-serif";
            var boldText = "bold " + textSize + "px sans-serif";
            View.context.font = boldText;
            View.context.fillStyle = View.colors.card.text;
            View.context.textAlign = 'left';
            View.context.textBaseline = 'alphabetic';
            var cardName = card.name;
            if (card.cardType === Model.CardType.root) {
                cardName = 'The ' + card.name;
            }
            View.context.fillText(cardName, cursor.x, cursor.y);
            // numbers
            cursor.movey(lineHeight);
            View.context.font = bodyText;
            View.context.fillText(card.attack + '/' + card.defense, cursor.x, cursor.y);
            cursor.movey(lineHeight);
            View.context.fillText('income: ' + card.income, cursor.x, cursor.y);
            // description
            cursor.movey(lineHeight);
            View.context.fillText(card.description, cursor.x, cursor.y);
            // children
            cursor.movey(lineHeight * 2);
            View.context.fillText('children', cursor.x, cursor.y);
            cursor.movey(lineHeight);
            View.context.font = bodyText;
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
                else if (btn.caption === 'control') {
                    if (card.cardLocation !== Model.CardLocation.structure) {
                        continue;
                    }
                }
                btn.moveTo(cursor);
                var hovered = (mouse && btn.rect.contains(mouse));
                if (hovered) {
                    View.hoveredButton = btn;
                }
                CardShape.drawRoundRect(btn.rect, 10);
                View.context.fillStyle = hovered ? View.colors.button.hoveredFill : View.colors.button.fill;
                View.context.fill();
                View.context.strokeStyle = View.colors.button.border;
                View.context.stroke();
                View.context.font = boldText;
                View.context.fillStyle = hovered ? View.colors.button.hoveredText : View.colors.button.text;
                View.context.textAlign = 'center';
                View.context.textBaseline = 'middle';
                var center = btn.rect.center;
                View.context.fillText(btn.caption, center.x, center.y);
                cursor.movex(btn.size.x + gutter);
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
            // orient was called before drawCard
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
            // draw card name
            var center = card.shape.rect.center;
            if (card.cardType === Model.CardType.group) {
                View.context.fillStyle = View.colors.card.text;
            }
            else {
                View.context.fillStyle = View.colors.rootCard.text;
            }
            View.context.textAlign = 'center';
            View.context.textBaseline = 'middle';
            View.context.fillText(card.name.substring(0, View.cardLength / 8), center.x, center.y);
            // draw the card's children
            card.links.forEach(function (child, direction) {
                if (typeof child !== 'number') {
                    var childDirection = (card.shape.rotation + direction + 2) % 4;
                    CardShape.orient(child, card.shape.links[direction], childDirection);
                    _this.drawCard(child);
                }
            });
        };
        View.orientRootCards = function (factions) {
            factions.forEach(function (faction, index) {
                faction.root.shape.rootPoint = new Util.Point(-View.cardLength / 2, -View.cardLength / 2);
                CardShape.orient(faction.root, faction.root.shape.rootPoint, 0);
            });
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
                link: '#444',
                fill: '#f0f0f0',
                text: 'gray',
                hoveredBorder: '#f80',
            },
            rootCard: {
                fill: '#888',
                link: '#fff',
                text: 'white',
            },
            screen: {
                fill: '#f8f8f8',
            },
        };
        return View;
    }());
    View_1.View = View;
})(View || (View = {}));
var Control;
(function (Control_1) {
    var State;
    (function (State) {
        State[State["table"] = 0] = "table";
        State[State["detail"] = 1] = "detail";
        State[State["choice"] = 2] = "choice";
        State[State["chooseLink"] = 3] = "chooseLink";
    })(State || (State = {}));
    ;
    var Control = /** @class */ (function () {
        function Control() {
            this.hoveredCard = null;
            this.hoveredLink = null;
            this.screenState = State.table;
            this.factionIndex = 0;
            this.command = null;
            this.attacker = null;
            this.defender = null;
            Model.Deck.init();
            Model.Model.initFactions(1);
            this.drawOpenCards();
            View.View.init();
            this.mouse = {
                down: false,
                drag: false,
                last: null,
            };
        }
        Object.defineProperty(Control.prototype, "activeFaction", {
            get: function () {
                return Model.Model.factions[this.factionIndex];
            },
            enumerable: true,
            configurable: true
        });
        Control.prototype.beginChooseLink = function (cardSet) {
            if (cardSet === void 0) { cardSet = Model.Deck.structureCards; }
            // TODO: show somehow that the "hovered" card is getting moved (gray out or attach to mouse)
            this.screenState = State.chooseLink;
            View.View.draw();
            this.linkTargets = Model.Model.getLinkTargets(View.View.hoveredCard, cardSet);
        };
        Control.prototype.beginChooseTarget = function () {
            this.screenState = State.table;
            View.View.canvas.style.cursor = 'crosshair';
            View.View.draw();
        };
        Control.prototype.drawOpenCards = function () {
            for (var i = 0; i < 4; ++i) {
                var card = Model.Deck.drawGroup().cardLocation = Model.CardLocation.open;
            }
        };
        Control.prototype.onMouseDown = function (event) {
            this.mouse.down = true;
            this.mouse.drag = false;
            this.mouse.last = new Util.Point(event.offsetX, event.offsetY);
        };
        Control.prototype.onMouseMove = function (event) {
            var mouse = new Util.Point(event.offsetX, event.offsetY);
            if (this.mouse.down && !mouse.equals(this.mouse.last)) {
                this.mouse.drag = true;
            }
            if (this.screenState === State.table) {
                if (this.mouse.drag) {
                    var delta = mouse.minus(this.mouse.last);
                    View.View.dragFocus(delta);
                    View.View.draw();
                }
                else {
                    var hovered = Model.Model.getHoveredCard(mouse, Model.Deck.tableCards);
                    if (hovered !== View.View.hoveredCard) {
                        View.View.hoveredCard = hovered;
                        View.View.draw();
                    }
                }
            }
            else if (this.screenState === State.chooseLink) {
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
            else if (this.screenState === State.detail) {
                View.View.drawDetail(View.View.hoveredCard, mouse);
            }
            this.mouse.last = mouse;
        };
        Control.prototype.onMouseOut = function (event) {
            this.mouse.down = false;
            this.mouse.drag = false;
        };
        Control.prototype.onMouseUp = function (event) {
            var mouse = new Util.Point(event.offsetX, event.offsetY);
            if (this.screenState === State.table) {
                if (this.mouse.drag) {
                }
                else if (View.View.hoveredCard) {
                    if (this.command == 'control') {
                        View.View.canvas.style.cursor = '';
                        this.defender = View.View.hoveredCard;
                        // TODO: handle control attempt
                        View.View.hoveredCard.cardLocation = Model.CardLocation.structure;
                        // TODO: new card should only link to controlling card
                        // place the newly controlled card
                        this.beginChooseLink([this.attacker]);
                        this.command = null;
                    }
                    else {
                        this.screenState = State.detail;
                        View.View.drawDetail(View.View.hoveredCard, mouse);
                    }
                }
            }
            else if (this.screenState === State.detail) {
                // TODO: buttons, options, etc.
                if (View.View.hoveredButton) {
                    var caption = View.View.hoveredButton.caption;
                    if (caption === 'move') {
                        this.beginChooseLink();
                    }
                    else if (caption === 'control') {
                        this.attacker = View.View.hoveredCard;
                        this.command = caption;
                        this.beginChooseTarget();
                    }
                }
                else {
                    this.screenState = State.table;
                    View.View.draw();
                }
            }
            else if (this.screenState === State.chooseLink) {
                // move the card !
                // TODO: check for card overlap
                if (this.hoveredLink) {
                    View.View.hoveredCard.decouple();
                    this.hoveredLink.card.addCard(View.View.hoveredCard, this.hoveredLink.linkIndex);
                }
                this.screenState = State.table;
                View.View.canvas.style.cursor = 'arrow';
                View.View.draw();
            }
            this.mouse.down = false;
            this.mouse.drag = false;
        };
        return Control;
    }());
    Control_1.Control = Control;
})(Control || (Control = {}));
var control;
window.addEventListener('load', function () {
    control = new Control.Control();
    window.addEventListener('mousemove', function (event) {
        control.onMouseMove(event);
    });
    window.addEventListener('mousedown', function (event) {
        control.onMouseDown(event);
    });
    window.addEventListener('mouseup', function (event) {
        control.onMouseUp(event);
    });
    window.addEventListener('mouseout', function (event) {
        control.onMouseOut(event);
    });
});
