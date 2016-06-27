/**
 * Created by RenCa on 07.09.2015.
 */


"use strict";
var NNE = new NNEvolution;
NNE.populations = window.populations;
NNE.stretchPaper(0, 0);
NNE.recount("", "", false);


NNE.SPACE = 10;
NNE.SCALE = {x: 40, y: 4};
NNE.normalizeGap(3);
//                    [[2], [3], [5], [2, 3, 5]].map(function(c){return c.reduce(function(p, c){return p + Math.log(c)}, 0)});
//NNE.drawFunctions(20, [Math.log(2),  Math.log(3), Math.log(5), Math.log(2) + Math.log(3) + Math.log(5)]);
//NNE.drawFunctions(20, [1, .5,  Math.sin(Math.PI / 3), Math.sin(Math.PI / 3) + 1.5]);

//NNE.testColors();

    // population name/type , draw trees? , draw plots? , trees interactive?
NNE.drawAll("test", true, true, true);

    // comparing names/types , comparing parameters , draw trees?
//NNE.compare(["_020_13_00", "_020_23_00"], ["value", "max", "min"], false);
//NNE.compare([
//    "p161_020_13_01", "p162_020_13_01", "p163_020_13_01", "p164_020_13_01", "p165_020_13_01", "p166_020_13_01", "p167_020_13_01", "p168_020_13_01", "p169_020_13_01"
//], ["value"], false);


// List of comparable parameters:
// max
// mid
// min
// med
// value

// List of population types:
// test
// _020_13_00
// _050_13_00
// _020_14_00

// List of population names:
// p002_020_13_00
// p003_100_13_00
// p005_020_13_20
// p006_020_13_00
// p100_020_13_00
// p101_020_13_00
// p102_020_13_00
// p103_020_13_00
// p104_020_13_00
// p110_050_13_00
// p111_050_13_00
// p112_050_13_00
// p113_050_13_00
// p114_050_13_00
// p120_020_14_00
// p121_020_14_00
// p122_020_14_00
// p123_020_14_00
// p124_020_14_00