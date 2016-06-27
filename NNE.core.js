"use strict";
function NNEvolution(paper) {

    var NNE = this;
    NNE.SPACE = 10;
    NNE.SCALE = {x: 40, y: 4};
    NNE.paper = paper;
    NNE.populations = window.populations;
    //NNE.populationsNames = Object.keys(NNE.populations);
    //NNE.currentPopulation = NNE.populationsNames[0];
    NNE.normalizeGap = function(g) {
        if (!g) {
            g = {l:0, r:0, u:0, d:0, h:0, v:0};
        } else if (!(g instanceof Object)) {
            if (isNaN(g)) {
                throw new Error("Gap has wrong type");
            } else {
                g = {l: g, r: g, u: g, d: g, h: g * 2, v: g * 2}
            }
        } else {
            var f = function(a, b) { return Math.max(a || 0, b || 0); };
            g = {l: f(g.l, g.x), r: f(g.r, g.x), u: f(g.u, g.y), d: f(g.d, g.y)};
            g.h = g.l + g.r;
            g.v = g.u + g.d;
        }
        NNE.GAP = g;
        return g;
    };
    NNE.stretchPaper = function(w, h) {
        NNE.paper.setSize(
            Math.max(w + NNE.SPACE, NNE.paper.width),
            Math.max(h + NNE.SPACE, NNE.paper.height)
        )
    };
    NNE.normalizeGap(2);

    var toString = function self(o, deep) {
        var n = deep ? "\n" : "";
        var s = deep ? " " : "";
        var result = "";
        deep = deep ? deep - 1 : 0;
        if (o instanceof Array) {
            result += o.reduce(function(p, c) { return p + (p ? "," + n : n) + self(c, deep) }, "");
            return "[" + result + (result ? n : "") + "]";
        } else if (typeof o === "object") {
            for (var key in o) {
                if (o.hasOwnProperty(key) && (o[key] || o[key] === 0) && typeof o[key] !== "function") {
                    result += (result ? "," + n : n) + key + ":" + s + self(o[key], deep);
                }
            }
            return "{" + result + (result ? n : "") + "}";
        } else if (typeof o === "string") {
            return '"' + o + '"';
        } else {
            return o.toString();
        }
    };
    var icons = ["M1,4 a3,3 0 1,1 0,0.00001z m4.6,0 a1.6,1.6 0 1,0 0,0.00001z",
        "M1,2 3,4 1,6 2,7 4,5 6,7 7,6 5,4 7,2 6,1 4,3 2,1z",
        "M0,4 3,7 8,2 7,1 3,5 1,3z",
        "M1,3.3 7,3.3 7,4.7 1,4.7z",
        "M1,4 a3,3 0 1,1 0,0.00001z"]; // 0:hollow circle , 1:cross , 2:tip , 3:dash , 4:filled circle
    var colors = [
        ["#d00","#800","#d77"], // red
        ["#fa0","#a60","#fd8"], // orange
        ["#ff0","#aa0","#ff8"], // yellow
        ["#0d0","#080","#7d7"], // green
        ["#0fa","#0a6","#8fd"], // green-blue
        ["#0af","#06a","#8df"], // cyan
        ["#00d","#008","#77d"], // blue
        ["#a0f","#60a","#d8f"], // magenta
        ["#f0a","#a06","#f8d"], // cream
        ["#999","#666","#ccc"]
    ];

    function drawAll(p, filter, trees, plots, interactiveTrees, stroke, scale, gap) {
        var draw = function(gen) {
            if (trees) {
                drawTree(gen, NNE.SPACE + scale.x, NNE.paper.height, stroke, scale, gap, interactiveTrees);
            } // draw trees
            if (plots) {
                drawPlot(gen, NNE.SPACE          , NNE.paper.height, stroke, scale, gap);
            } // draw plots
            if (trees || plots) {
                NNE.stretchPaper(0, NNE.paper.height);
            } // stretch canvas
        };
        var found = false;
        for (var key in p) {
            if (p.hasOwnProperty(key) && (!filter || p[key].type === filter)) {
                draw(p[key]);
                found = true;
            }
        } // searching for type = "name"
        if (!found) {
            if (p.hasOwnProperty(filter)) {
                draw(p[filter]);
                found = true;
            } else {
                alert("can't find any population with name '" + name + "', or type '" + name + "'!");
            }
        } // searching for name = "name"
    }

    function compare(p, groups, paramsForComparing, trees, stroke, scale, gap) {
        var height = 0;
        var length = 0;
        var addGeneration = function(gen) {
            if (trees) {
                drawTree(gen, NNE.SPACE + scale.x, NNE.paper.height, stroke, scale, gap);
                //drawPlot(gen, NNE.SPACE, NNE.paper.height, stroke, scale, gap);
            }
            groupStat.push(gen);
            for (var j = 0; j < paramsForComparing.length; j++) {
                height = Math.max(height, gen.stat[paramsForComparing[j]].h);
            } // stretching height
            length = Math.max(length, gen.I.length); // stretching length
        };
        var pickColor = function(i, n) {
            return n > 6 ? i : n > 3 ? (i * 3 + i % 2) / 2 : i * 3;
        };
        for (var i = 0; i < groups.length; i++) {
            var groupStat = [];
            var found = false;
            var name = groups[i];
            if (name === "test") {
                alert("sorry, type 'test' cannot be compared to other types");
                continue;
            }
            for (var key in p) {
                if (p.hasOwnProperty(key) && p[key].type === name) {
                    addGeneration(p[key]);
                    found = true;
                    console.log("found type " + name + " " + groupStat.length);
                }
            } // searching for type = "name"
            if (!found) {
                if (p.hasOwnProperty(name)) {
                    addGeneration(p[name]);
                    found = true;
                    console.log("found name " + name + " " + groupStat.length);
                } else {
                    alert("can't find any population with name '" + name + "', or type '" + name + "'!");
                }
            } // searching for name = "name"
            if (found && trees) {
                NNE.stretchPaper(0, NNE.paper.height);
            } // increases paper.height with 1 SPACE
            groups[i] = groupStat;
        } // preparing groups
        height = (height / 10 ^ 0) * 10; // final height
        var gridShift = {x: gap.l + NNE.SPACE, y: gap.u + NNE.paper.height};
        drawGrid(NNE.SPACE, NNE.paper.height, -1, 0, length, height / 10, stroke, scale, gap);
        for (i = 0; i < groups.length; i++) {
            drawGroup(groups[i], paramsForComparing, gridShift.x, gridShift.y,
                length, height, scale, pickColor(i, groups.length), stroke * 2,
                (i - (groups.length - 1) / 2) * 3 /** paramsForComparing.length*/);
        }
    }

    function recount(p, filter, replacement, forceRecount) {

        console.log("start recounting");

        var recountTree = function(gen) {
            var pA = [];
            var cA = [];
            var k = gen.N <= 10 ? 10 : gen.N <= 100 ? 100 : 1000;
            for (var i = 0; i < gen.I.length; i++) {

                //pA[i] = {};
                pA[i] = [];
                for (j = 0; j < gen.N; j++) {
                    pA[i][j] = 0;
                }

                cA[i] = {}; // initializing children object

                for (var j = gen.N; j < gen.I[i].length; j += 3) {
                    var c = gen.I[i][j];
                    var p1 = gen.I[i][j + 1];
                    var p2 = gen.I[i][j + 2];
                    if (p1 > p2) {
                        var p3 = p1;
                        p1 = p2;
                        p2 = p3;
                    } // smaller parent comes first
                    cA[i][p1] = cA[i][p1] || [];
                    cA[i][p2] = cA[i][p2] || [];
                    cA[i][p1].push(c);
                    cA[i][p2].push(c);
                    pA[i][c] = p1 * k + p2; // merged indexes version
                }

            }
            gen.parents = pA;
            gen.children = cA;
        };

        var recountStat = function(gen) {
            var s = { max: {}, mid: {}, min: {}, med: {}, value: {} };
            for (var key in s) {
                if (s.hasOwnProperty(key)) {
                    s[key].h = 0;
                    s[key].a = [];
                    //s[key].d = [];
                }
            } // initializing stat objects
            var newData = function(o, value) {
                //o.d.push(value - (o.a[o.a.length - 1] || 0));
                o.a.push(value);
                if (value > o.h) {
                    o.h = value;
                }
            };
            var medium = function(a) {
                var mid = (p.length - 1) / 2 ^ 0;
                if (a.length % 2) {
                    return a[mid];
                } else {
                    return (a[mid] + a[mid + 1]) / 2 ^ 0;
                }
            };
            var value = [];
            var notValued = [];
            for (var i = 0; i < gen.I.length; i++) {
                value[i] = 0;
            } // initializing value array with zeros
            var addPoints = function(stop) {
                for (var k = born; k <= stop; k++) {
                    value[k] += score / attempts;
                }
                born = i + 1;
                score = 0;
                attempts = 0;
            }; // point adding function
            for (var j = 0; j < gen.N; j++) {
                var born = 0;
                var score = 0;
                var attempts = 0;
                for (i = 0; i < gen.I.length; i++) {
                    if (gen.I[i].hasOwnProperty(j + "")) {
                        var points = gen.I[i][j];
                        score += Math.abs(points);
                        attempts++;
                        for (var k = gen.N; k < gen.I[i].length; k += 3) {
                            if (gen.I[i][k] === j) {
                                addPoints(i);
                            }
                        } // if agent died - add his points to the population value
                    }
                } // reading value data from the log
                if (attempts) {
                    addPoints(gen.I.length - 1);
                } else {
                    for (i = 0; i < gen.I.length - born; i++) {
                        notValued[i] = notValued[i] || 0;
                        notValued[i]++;
                    }
                } // finalizing value data
            } // calculating population value
            for (i = 0; i < gen.I.length; i++) {
                var sum = 0;
                var p = [];
                for (j = 0; j < gen.N; j++) {
                    points = +gen.I[i][j];
                    sum += points;
                    p.push(points);
                }
                p.sort( function (a, b) { return +a > +b ? 1 : -1; } );
                newData(s.min, p[0] ^ 0);
                newData(s.mid, sum / p.length ^ 0);
                newData(s.max, p[p.length - 1] ^ 0);
                newData(s.med, medium(p));
                newData(s.value, value[i] / (gen.N - (notValued[gen.I.length - i - 1] || 0)) ^ 0);
            } // filling stat objects
            gen.stat = s;
            //return '\n, stat: ' + toString(s, 2) + ' ';
        };

        var logData = function(key) {
            var result = "";
            for (var i in p[key]) {
                if (p[key].hasOwnProperty(i)) {
                    result += (result ? ",\n" : "\n") + i + ": " + toString(p[key][i], /*i === "stat" ? 2 :*/ 1);
                }
            }
            return key + ": {" + result + "\n}";
        };

        var resultLog = "";
        var recountedTypes = {};
        for (var key in p) {
            if (p.hasOwnProperty(key) && (!filter || p[key].type === filter)) {
                var g = p[key];
                if (forceRecount) {
                    recountStat(g);
                    recountTree(g);
                } else {
                    var s = g.stat;
                    var changed = false;
                    if (!s || !s.max || !s.mid || !s.min || !s.med || !s.value) {
                        recountStat(g);
                        changed = true;
                    }
                    if (!g.parents || !g.children) {
                        recountTree(g);
                        changed = true;
                    }
                }
                if (filter && replacement) {
                    p[key].type = replacement;
                }
                if (forceRecount || changed) {
                    var comment = forceRecount && !recountedTypes[p[key].type] ? "\n//" + p[key].type + "\n": "";
                    resultLog += (resultLog ? ",\n" : "") + comment + logData(key);
                    recountedTypes[p[key].type] = true;
                }
            }
        } // recalculating statistic and tree data
        console.log(resultLog || "no populations has been recounted");
    }

    function returnPath(a, style, height, scale) {
        height *= scale.y;
        var result = "", arr = a instanceof Array, limit = a.limit || a.length;
        if (style === "plank" && arr) {
            for (var i = 0, last = -1, max = 0; i < limit; i++) {
                var value = arr ? a[i] : a(i);
                if (value > max) {
                    result += "h" + (i - last - (result ? .25 : .75)) * scale.x +
                        "m" + .25 * scale.x + "," + (max - value) * scale.y;
                    max = value;
                    last = i;
                }
            }
            result = "M0," + (height - 2.5) + result + "h" + (a.length - last - 0.5) * scale.x;
        } else {
            last = value = 0;
            for (i = 0; i < limit; i++) {
                value = arr ? a[i] : a(i);
                var deltaValue = (last - value) * scale.y;
                result += !deltaValue ?
                    "h" + scale.x : style === "curve" ?
                    "c" + scale.x * .7 + ",0" +
                    " " + scale.x * .3 + "," + deltaValue +
                    " " + scale.x + "," + deltaValue :
                    "l" + scale.x + "," + deltaValue;
                last = value;
            }
            result = "M0," + height + result;
        }
        return result;
    }

    function drawGrid(x, y, x1, y1, x2, y2, stroke, scale, gap) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        var width = dx * scale.x + gap.h;
        var height = dy * scale.y + gap.v;
        NNE.stretchPaper(x + width, y + height);
        NNE.paper.rect(x - NNE.SPACE / 2, y - NNE.SPACE / 2, width + NNE.SPACE, height + NNE.SPACE);//.attr({stroke: "none", fill: "#f7f7f7"});]
        var color = ["#eee", "#ddd", "#bbb", "#848484", "#585858", "333"];
        var mod = [1, 5, 10, 50, 100, 500];
        var columns = [];
        var rows = [];
        var gridShift = {x: x + gap.l - x1 * scale.x, y: y + gap.u - y1 * scale.y};
        for (var i = x1; i <= x2; i++) {
            columns.push(NNE.paper.path("M" + (i * scale.x + gridShift.x) + "," + y + " l 0," + height)
                .attr({stroke: color[0], "stroke-width": stroke, "stroke-linecap": "square"}));
        } // columns
        for (i = y1; i <= y2; i++) {
            rows.push(NNE.paper.path("M" + x + "," + ((y2 + y1 - i) * scale.y + gridShift.y) + " l " + width + ",0")
                .attr({stroke: color[0], "stroke-width": stroke, "stroke-linecap": "square"}));
        }// rows
        for (var j = 1; j < mod.length; j++) {
            if (mod[j] < dx || j < 4 && mod[j - 1] < dx) {
                var initialLine = (-x1 % mod[j] + mod[j]) % mod[j];
                for (i = initialLine; i < columns.length; i += mod[j]) {
                    columns[i].attr({stroke: color[j]}).toFront();
                }
            } // sorting columns
            if (mod[j] < dy || j < 4 && mod[j - 1] < dy) {
                initialLine = (-y1 % mod[j] + mod[j]) % mod[j];
                for (i = initialLine; i < rows.length; i += mod[j]) {
                    rows[i].attr({stroke: color[j]}).toFront();
                }
            } // sorting rows
        } // sorting and coloring
    }

    function drawTree(gen, x, y, stroke, scale, gap, interactiveTrees) {
        var gridShift = {x: gap.l + x, y: gap.u + y};
        var iconSize = Math.min(scale.x / 2, scale.y);
        var iconShift = {x: gridShift.x - iconSize / 2, y: gridShift.y - iconSize / 2};
        var iconScale = "s" + iconSize / 8 + "," + iconSize / 8 + ",0,0";

        var curveAttr = {stroke: "#000", "stroke-width": stroke / 3, "stroke-linecap": "round", "stroke-opacity": 0.4};
        var boldCurveAttr = function(color, opacity) {
            return {
                stroke: color,
                "stroke-width": stroke,
                "stroke-opacity": opacity
            }
        };
        var ownAgentColor = "#000";
        var parentsColor = "#00f";
        var childrenColor = "#f0f";


        var hoverZoom = 1.4;
        var hoverStroke = 0.7;
        var koef = gen.N <= 10 ? 10 : gen.N <= 100 ? 100 : 1000;

        var zoomIcon = function (icon, b) {
            if (!icon.data("oldTransform") === b) {
                if (b) {
                    icon.data("oldTransform", icon.transform()).transform("...s" + hoverZoom);
                } else {
                    icon.transform(icon.data("oldTransform")).data("oldTransform", "");
                }
            }
        };
        if (interactiveTrees) {
            var highlight = function (a, b, color, opacity) {
                zoomIcon(a.icon, b);
                a.icon.attr(b ? {
                    stroke: color,
                    "stroke-width": hoverStroke,
                    "stroke-opacity": opacity
                } : {stroke: "none"});
                a.highlighted = b;
            };
            var trackAgent = function self(a, b, color, trackUp, trackDown) {
                //var opacity = trackUp && trackDown ? 1.0 : 0.4;
                var opacity = 1.0;
                if (!a.highlighted === b) {
                    highlight(a, b, color, opacity); // highlight agent icon
                    if (a.line) {
                        a.line.attr(b ? {stroke: color, "stroke-width": hoverStroke} : {stroke: "none"});
                    } // highlight agent line
                    var i = a.i;
                    while (gen.agents[i][a.n].next) {
                        i++;
                        highlight(gen.agents[i][a.n], b, color, opacity);
                    } // highlight all following agent occurrences
                    i = a.i;
                    while (gen.agents[i][a.n].prev) {
                        i--;
                        highlight(gen.agents[i][a.n], b, color, opacity);
                    } // highlight all previous agent occurrences
                    var subject = gen.agents[a.born][a.n];
                    if (trackUp && subject.parents) {
                        self(subject.parents[0], b, parentsColor, true, false);
                        subject.parents[0].childCurves[a.n].attr(b ? boldCurveAttr(parentsColor, opacity) : curveAttr);
                        self(subject.parents[1], b, parentsColor, true, false);
                        subject.parents[1].childCurves[a.n].attr(b ? boldCurveAttr(parentsColor, opacity) : curveAttr);
                    }
                    if (trackDown) {
                        for (i = a.born; i <= a.died && i < gen.I.length; i++) {
                            subject = gen.agents[i][a.n];
                            for (var c in subject.childAgents) {
                                self(subject.childAgents[c], b, childrenColor, false, true);
                            }
                            for (c in subject.childCurves) {
                                subject.childCurves[c].attr(b ? boldCurveAttr(childrenColor, opacity) : curveAttr);
                            }
                        }
                    }
                }
            };
            var hoverIn = function () {
                trackAgent(this.data("agent"), true, ownAgentColor, true, true);
            };
            var hoverOut = function () {
                trackAgent(this.data("agent"), false, "#d7f", true, true);
            };
        } // initializing interactivity functions

        var pickColor = function (s) {
            s += 30;
            return Raphael.hsb(
                (s > 100 ? 120 : s > 90 ? (s - 70) * 4 : s > 80 ? (s - 50) * 2 : s > 40 ? s - 20 : s > 30 ? (s - 30) * 2 : 0) / 360,
                .9, s > 160 ? .4 : s > 100 ? 2 - s / 100 : s > 30 ? 1 : s / 30);
        };
        var drawChildCurve = function (a, child) {
            var x = a.i * scale.x + gridShift.x;
            var y1 = (gen.N - 1 - a.n) * scale.y + gridShift.y;
            var y2 = (gen.N - 1 - child) * scale.y + gridShift.y;
            a.childrenNum++;
            a.childCurves[child] = NNE.paper.path(
                    "M" + x + "," + y1 +
                    "l" + (scale.x / 8) + ",0" +
                    "C" + (x + scale.x / 2) + "," + y1 +
                    " " + (x + scale.x / 2) + "," + y2 +
                    " " + (x + scale.x * 7 / 8) + "," + y2 +
                    "l" + (scale.x / 8) + ",0"
                ).attr(curveAttr).insertBefore(gen.agents[0][0].icon);
        };
        var drawAgent = function (a) {
            a.icon = NNE.paper.path(icons[gen.parents[a.i][a.n] ? 1 : 4]).attr({
                fill: pickColor(a.points / 2),
                stroke: "none"
            }).data("agent", a).transform("T" + (a.i * scale.x + iconShift.x) + "," + ((gen.N - 1 - a.n) * scale.y + iconShift.y) + iconScale);
            if (interactiveTrees) {
                a.icon.hover(hoverIn, hoverOut);
            }
        };
        var newAgentLine = function(a) {
            a.born = a.i;
            a.died = a.i;
            while (a.died < gen.I.length && !gen.parents[a.died][a.n]) {
                a.died++;
            }
            if (a.died > a.born) {
                a.line = NNE.paper.path(
                        "m" + (a.born * scale.x + gridShift.x) +
                        "," + ((gen.N - 1 - a.n) * scale.y + gridShift.y) +
                        "h" + (a.died - a.born) * scale.x)
                    .insertBefore(a.icon)
                    .attr({stroke:"none"}); // hide
            }
        };

        drawGrid(x, y, 0, 0, gen.I.length, gen.N - 1, stroke, scale, gap);

        gen.agents = [];
        for (var i = 0; i < gen.I.length; i++) {
            gen.agents[i] = [];
            if (gen.type) {
                for (var j = 0; j < gen.N; j++) {
                    gen.agents[i][j] = {
                        i: i,
                        n: j,
                        points: gen.I[i][j],
                        childrenNum: 0,
                        childAgents: {},
                        childCurves: {}
                    }; // raw agent object
                    drawAgent(gen.agents[i][j]); // icon
                    if (gen.children[i][j]) {
                        for (var k = 0; k < gen.children[i][j].length; k++) {
                            drawChildCurve(gen.agents[i][j], gen.children[i][j][k]);
                        }
                    } // childCurves
                    if (i) {
                        var p = gen.parents[i - 1][j];
                        if (p) {
                            newAgentLine(gen.agents[i][j]); // line , born , died
                            var n1 = p % koef;
                            var n2 = p / koef ^ 0;
                            gen.agents[i][j].parents = [gen.agents[i - 1][n1], gen.agents[i - 1][n2]];
                            gen.agents[i - 1][n1].childAgents[j] = gen.agents[i][j];
                            gen.agents[i - 1][n2].childAgents[j] = gen.agents[i][j];
                        } else {
                            gen.agents[i][j].line = gen.agents[i - 1][j].line;
                            gen.agents[i][j].born = gen.agents[i - 1][j].born;
                            gen.agents[i][j].died = gen.agents[i - 1][j].died;
                            gen.agents[i][j].prev = gen.agents[i - 1][j];
                            gen.agents[i - 1][j].next = gen.agents[i][j];
                        }
                    } // childAgents , parents , prev , next , line , born , died
                    else {
                        newAgentLine(gen.agents[i][j]); // agents[i][j].agentLine , born , died
                    } // line , born , died
                }
            }
        } // drawing data
    }

    function drawStat(a, x, y, height, scale, style, color, strokeWidth) {
        var attr = {
            stroke: color || "#000",
            "stroke-width": strokeWidth || 1
        }; // default attributes
        if (style === "plank") {
            attr["stroke-dasharray"] = "-";
        } else {
            attr["stroke-linecap"] = "round";
            if (style === "curve") {
                attr["stroke-linejoin"] = "round";
            }
        } // additional attributes
        var path = returnPath(a, style, height, { x: scale.x, y: scale.y / 10 });
        NNE.paper.path(path).attr(attr).transform("t" + x + "," + y);
    }

    function drawPlot(gen, x, y, stroke, scale, gap) {
        var height = 0;
        for (var key in gen.stat) {
            if (gen.stat.hasOwnProperty(key)) {
                height = Math.max(height, gen.stat[key].h);
            }
        } // counting height
        height = (height / 10 ^ 0) * 10 + 10;

        var curveWidth = 2;
        var plankWidth = 1;

        var gridShift = {x: gap.l + x, y: gap.u + y};

        var drawPlotStat = function(key, color) {
            var curveColor = colors[color][0];
            var plankColor = colors[color][1];
            if (curveColor) {
                drawStat(gen.stat[key].a, gridShift.x, gridShift.y, height, scale, "curve", curveColor, curveWidth);
            }
            if (plankColor) {
                drawStat(gen.stat[key].a, gridShift.x, gridShift.y, height, scale, "plank", plankColor, plankWidth);
            }
        };

        drawGrid(x, y, -1, 0, gen.I.length, height / 10, stroke, scale, gap);

        drawPlotStat("min", 0); // red
        drawPlotStat("mid", 1); // orange
        drawPlotStat("max", 3); // green
        drawPlotStat("med", 9); // gray
        drawPlotStat("value", 6); // blue
    }

    function drawGroup(group, params, x, y, length, height, scale, color, stroke, shift) {

        var markerW = 4;
        var markersAttr = {
            "stroke-width": stroke / 2,
            "stroke-opacity": 1
        };
        /*shift += (1 - params.length) * 3;*/
        for (var i = 0; i < params.length; i++) {

            markersAttr.stroke = colors[color][i];
            var groupAverageScore = [];
            var prevHeight = 0;
            var markerPath = "";
            if (group.length > 1) {
                for (var j = 0; j < length; j++) {
                    var min = height;
                    var max = 0;
                    var sum = 0;
                    for (var k = 0; k < group.length; k++) {
                        var value = group[k].stat[params[i]].a[j];
                        min = Math.min(min, value);
                        max = Math.max(max, value);
                        sum += value;
                        if (!markerPath) {
                            prevHeight = value;
                            markerPath = "m" + (x + shift - markerW / 2 + scale.x) + "," + (y + (height - value) * scale.y / 10) + "h" + markerW;
                        } else {
                            markerPath += "m" + (k ? -markerW : scale.x - markerW / 2) + "," + (prevHeight - value) * scale.y / 10 + "h" + markerW;
                            prevHeight = value;
                        } // draw marker at iteration*j+shift at height (value)
                    }
                    markerPath += "m" + (-markerW) / 2 + "," + (prevHeight - min) * scale.y / 10 + "v" + (min - max) * scale.y / 10;
                    prevHeight = max; // draw vertical at iteration+j+shift from (min) to (max)

                    groupAverageScore[j] = sum / group.length;
                }
                NNE.paper.path(markerPath).attr(markersAttr);
                drawStat(groupAverageScore, x, y, height, scale, "curve", colors[color][i], stroke);
            } else {
                drawStat(group[0].stat[params[i]].a, x, y, height, scale, "curve", colors[color][i], stroke);
            }
            /*shift += 6;*/

        }
    }

    NNE.testColors = function() {
        console.log("testing colors");
        var height = colors.length;
        var width = colors[0].length;
        var gridShift = {x: NNE.GAP.l + NNE.SPACE, y: NNE.GAP.u + NNE.paper.height};
        drawGrid(NNE.SPACE, NNE.paper.height, 0, 0, width - 1, height - 1,.5, {x: 8, y: 8}, NNE.GAP);
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                NNE.paper.path(icons[4])
                    .attr({fill: colors[i][j], stroke: "none"})
                    .transform("T" + (j * 8 + gridShift.x - 4) + "," + (i * 8 + gridShift.y - 4));
            }
        }
    };

    NNE.attachSelectElement = function(selectElement) {
        var profileNames = Object.keys(NNE.populations);
        profileNames.forEach(function(name){
            var newOption = document.createElement("option");
            newOption.value = name;
            newOption.textContent = name;
            selectElement.appendChild(newOption);
        });
        selectElement.addEventListener("change", function(ev) {
            var selectedPopulationName = selectElement.value;
            NNE.paper.clear();
            NNE.paper.setSize(1, 1);
            NNE.stretchPaper(0, 0);
            NNE.currentPopulation = selectedPopulationName;
            NNE.drawCurrent();
        }, false);
        NNE.currentPopulation = profileNames[0]
    };

    NNE.drawAll = function(filter, trees, plots, interactiveTrees) {
        drawAll(NNE.populations, filter, trees, plots, interactiveTrees, .5, NNE.SCALE, NNE.GAP);
    };
    NNE.drawCurrent = function(trees, plots, interactiveTrees) {
        if (trees === undefined) trees = true;
        if (plots === undefined) plots = true;
        if (interactiveTrees === undefined) interactiveTrees = true;
        NNE.drawAll(NNE.currentPopulation, trees, plots, interactiveTrees);
    };
    NNE.compare = function(groups, paramsForComparing, trees) {
        compare(NNE.populations, groups, paramsForComparing, trees, .5, NNE.SCALE, NNE.GAP);
    };
    NNE.recount = function(filter, replacement, forceRecount) {
        recount(NNE.populations, filter || "", replacement || "", forceRecount || false);
    };
}