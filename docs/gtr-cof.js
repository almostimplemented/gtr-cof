"use strict";
var mod;
(function (mod) {
    var Mod = (function () {
        function Mod(items) {
            this.size = 0;
            this.start = 0;
            this.items = items;
            this.size = items.length;
        }
        Mod.prototype.setStart = function (start) {
            this.start = start % this.size;
        };
        Mod.prototype.itemAt = function (index) {
            return this.items[(this.start + index) % this.size];
        };
        Mod.prototype.toArray = function () {
            var newArray = [];
            for (var i = 0; i < this.size; i++) {
                newArray.push(this.items[(i + this.start) % this.size]);
            }
            return newArray;
        };
        Mod.prototype.merge = function (items) {
            var theseItems = this.toArray();
            return zip(theseItems, items);
        };
        Mod.prototype.merge3 = function (items2, items3) {
            var theseItems = this.toArray();
            return zip3(theseItems, items2, items3);
        };
        return Mod;
    }());
    mod.Mod = Mod;
    function zip(a, b) {
        if (a.length != b.length) {
            throw "Cannot merge arrays of different lengths";
        }
        return a.map(function (x, i) { return [x, b[i]]; });
    }
    mod.zip = zip;
    function zip3(a, b, c) {
        if (a.length != b.length || a.length != c.length) {
            throw "Cannot merge arrays of different lengths";
        }
        return a.map(function (x, i) { return [x, b[i], c[i]]; });
    }
    mod.zip3 = zip3;
    function diff(size, a, b) {
        var ax = a % size;
        var bx = b % size;
        if (ax == bx)
            return 0;
        var d1 = bx - ax;
        var d2 = 0;
        if (d1 > 0) {
            d2 = -((ax + size) - bx);
        }
        else {
            d2 = (bx + size) - ax;
        }
        return Math.abs(d1) > Math.abs(d2) ? d2 : d1;
    }
    mod.diff = diff;
})(mod || (mod = {}));
var modTest = new mod.Mod([0, 1, 2, 3, 4, 5]);
var events;
(function (events) {
    var Bus = (function () {
        function Bus() {
            this.listeners = [];
        }
        Bus.prototype.subscribe = function (listener) {
            this.listeners.push(listener);
        };
        Bus.prototype.publish = function (event) {
            for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
                var listener = _a[_i];
                listener(event);
            }
        };
        return Bus;
    }());
    events.Bus = Bus;
    events.scaleChange = new Bus();
    events.tonicChange = new Bus();
    events.modeChange = new Bus();
    events.chordChange = new Bus();
    events.tuningChange = new Bus();
    events.leftHandedChange = new Bus();
    events.fretboardLabelChange = new Bus();
    var FretboardLabelType;
    (function (FretboardLabelType) {
        FretboardLabelType[FretboardLabelType["None"] = 0] = "None";
        FretboardLabelType[FretboardLabelType["NoteName"] = 1] = "NoteName";
        FretboardLabelType[FretboardLabelType["Interval"] = 2] = "Interval";
    })(FretboardLabelType = events.FretboardLabelType || (events.FretboardLabelType = {}));
})(events || (events = {}));
var cookies;
(function (cookies) {
    function init() {
        events.scaleChange.subscribe(bakeCookie);
    }
    cookies.init = init;
    function bakeCookie(scaleChange) {
        var cookieExpiryDays = 30;
        var expiryDate = new Date(Date.now() + (cookieExpiryDays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + expiryDate.toUTCString();
        document.cookie = "gtr-cof-state="
            + scaleChange.index + "|"
            + scaleChange.noteBase.id + "|"
            + scaleChange.mode.index + "|"
            + scaleChange.chordIndex
            + ";" + expires;
    }
    function readCookie() {
        var result = document.cookie.match(new RegExp("gtr-cof-state" + '=([^;]+)'));
        if (result != null) {
            var items = result[1].split("|");
            if (items.length == 4) {
                return {
                    hasCookie: true,
                    index: Number(items[0]),
                    noteBaseIndex: Number(items[1]),
                    modeIndex: Number(items[2]),
                    chordIndex: Number(items[3])
                };
            }
        }
        return {
            hasCookie: false,
            index: 0,
            noteBaseIndex: 0,
            modeIndex: 0,
            chordIndex: -1
        };
    }
    cookies.readCookie = readCookie;
})(cookies || (cookies = {}));
var music2;
(function (music2) {
    var IntervalType;
    (function (IntervalType) {
        IntervalType[IntervalType["Nat"] = 0] = "Nat";
        IntervalType[IntervalType["Maj"] = 1] = "Maj";
        IntervalType[IntervalType["Min"] = 2] = "Min";
        IntervalType[IntervalType["Aug"] = 3] = "Aug";
        IntervalType[IntervalType["Dim"] = 4] = "Dim";
    })(IntervalType = music2.IntervalType || (music2.IntervalType = {}));
    ;
    music2.intervalName = {};
    music2.intervalName[IntervalType.Nat] = "";
    music2.intervalName[IntervalType.Maj] = "M";
    music2.intervalName[IntervalType.Min] = "m";
    music2.intervalName[IntervalType.Aug] = "A";
    music2.intervalName[IntervalType.Dim] = "d";
    ;
    music2.getIntervalName = function (interval) { return music2.intervalName[interval.type] + (interval.ord + 1); };
    music2.intervals = new mod.Mod([
        [{ ord: 0, type: IntervalType.Nat }, { ord: 1, type: IntervalType.Dim }],
        [{ ord: 1, type: IntervalType.Min }, { ord: 0, type: IntervalType.Aug }],
        [{ ord: 1, type: IntervalType.Maj }, { ord: 2, type: IntervalType.Dim }],
        [{ ord: 2, type: IntervalType.Min }, { ord: 1, type: IntervalType.Aug }],
        [{ ord: 2, type: IntervalType.Maj }, { ord: 3, type: IntervalType.Dim }],
        [{ ord: 3, type: IntervalType.Nat }, { ord: 2, type: IntervalType.Aug }],
        [{ ord: 4, type: IntervalType.Dim }, { ord: 3, type: IntervalType.Aug }],
        [{ ord: 4, type: IntervalType.Nat }, { ord: 5, type: IntervalType.Dim }],
        [{ ord: 5, type: IntervalType.Min }, { ord: 4, type: IntervalType.Aug }],
        [{ ord: 5, type: IntervalType.Maj }, { ord: 6, type: IntervalType.Dim }],
        [{ ord: 6, type: IntervalType.Min }, { ord: 5, type: IntervalType.Aug }],
        [{ ord: 6, type: IntervalType.Maj }, { ord: 0, type: IntervalType.Dim }],
    ]);
    // root diatonic scale is major
    music2.diatonic = new mod.Mod([true, false, true, false, true, true, false, true, false, true, false, true]);
    music2.indexList = new mod.Mod([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    // fixed index:
    // 0  1  2  3  4  5  6  7  8  9  10 11 
    // A     B  C     D     E  F     G
    var NoteName;
    (function (NoteName) {
        NoteName[NoteName["A"] = 0] = "A";
        NoteName[NoteName["B"] = 2] = "B";
        NoteName[NoteName["C"] = 3] = "C";
        NoteName[NoteName["D"] = 5] = "D";
        NoteName[NoteName["E"] = 7] = "E";
        NoteName[NoteName["F"] = 8] = "F";
        NoteName[NoteName["G"] = 10] = "G";
    })(NoteName = music2.NoteName || (music2.NoteName = {}));
    ;
    music2.noteList = new mod.Mod([
        NoteName.A,
        NoteName.B,
        NoteName.C,
        NoteName.D,
        NoteName.E,
        NoteName.F,
        NoteName.G,
    ]);
    music2.noteIndex = [];
    music2.noteIndex[NoteName.A] = 0;
    music2.noteIndex[NoteName.B] = 1;
    music2.noteIndex[NoteName.C] = 2;
    music2.noteIndex[NoteName.D] = 3;
    music2.noteIndex[NoteName.E] = 4;
    music2.noteIndex[NoteName.F] = 5;
    music2.noteIndex[NoteName.G] = 6;
    var noteLabels = [
        { offset: 0, label: '' },
        { offset: 1, label: '♯' },
        { offset: 2, label: 'x' },
        { offset: -1, label: '♭' },
        { offset: -2, label: '♭♭' },
    ];
    ;
    music2.modes = [
        { name: 'Lydian', index: 5 },
        { name: 'Major / Ionian', index: 0 },
        { name: 'Mixolydian', index: 7 },
        { name: 'Dorian', index: 2 },
        { name: 'N Minor / Aeolian', index: 9 },
        { name: 'Phrygian', index: 4 },
        { name: 'Locrian', index: 11 },
    ];
    ;
    function generateScaleShim(noteBase, index, mode) {
        var note = (noteBase.index + 3) % 12;
        var newIndex = (index + 3) % 12;
        var newMode = music2.modes.filter(function (x) { return x.name === mode.name; })[0];
        var scale = generateScale(newIndex, note, newMode);
        console.log(scale.filter(function (x) { return x.isScaleNote; }).map(function (x) { return x.label + " "; }).join());
        var chordNumbers = generateChordNumbers(scale);
        mod.zip(scale, chordNumbers).forEach(function (x) { return x[0].chordNumber = x[1]; });
        return generateNodes(scale);
    }
    music2.generateScaleShim = generateScaleShim;
    function generateScale(index, note, mode) {
        var scale = [];
        music2.indexList.setStart(index);
        music2.diatonic.setStart(mode.index);
        music2.noteList.setStart(music2.noteIndex[note]);
        music2.intervals.setStart(0);
        var workingSet = music2.indexList.merge3(buildScaleCounter(music2.diatonic.toArray()), music2.intervals.toArray());
        var getLabel = function (index, noteNum) {
            var noteIndex = music2.noteList.itemAt(noteNum);
            var offset = mod.diff(12, noteIndex, index);
            var noteLabel = noteLabels.filter(function (x) { return x.offset === offset; })[0];
            return NoteName[music2.noteList.itemAt(noteNum)] + noteLabel.label;
        };
        return workingSet.map(function (item) {
            var index = item[0];
            var isScaleNote = item[1][0];
            var noteNumber = item[1][1];
            var activeInterval = isScaleNote
                ? item[2].filter(function (x) { return x.ord == noteNumber; })[0]
                : item[2][0];
            var label = isScaleNote
                ? getLabel(index, noteNumber)
                : getLabel(index, activeInterval.ord);
            // console.log("index: " + index + ", isScaleNote: " + isScaleNote + ", scaleCounter: " 
            //     + noteNumber + ", label: " + label + ", interval: " + getIntervalName(activeInterval))
            return {
                index: index,
                label: label,
                interval: activeInterval,
                intervalName: music2.getIntervalName(activeInterval),
                isScaleNote: isScaleNote,
                noteNumber: noteNumber,
                diatonicOffset: mode.index
            };
        });
    }
    music2.generateScale = generateScale;
    // generateNodes creates an 'outer' sliding interval ring that can change with
    // chord selections.
    function generateNodes(scaleNotes, chordIndex) {
        if (chordIndex === void 0) { chordIndex = 0; }
        var chordIndexOffset = ((chordIndex + 12) - scaleNotes[0].index) % 12;
        music2.intervals.setStart(12 - chordIndexOffset);
        music2.diatonic.setStart(scaleNotes[0].diatonicOffset);
        var startAt = scaleNotes.filter(function (x) { return x.index === chordIndex; })[0].noteNumber;
        var workingSet = music2.intervals.merge3(scaleNotes, buildScaleCounter(music2.diatonic.toArray(), startAt));
        return workingSet.map(function (item) {
            var chordIntervalCandidates = item[0];
            var scaleNote = item[1];
            var scaleCounter = item[2];
            var activeInterval = scaleNote.isScaleNote
                ? chordIntervalCandidates.filter(function (x) { return x.ord === scaleCounter[1]; })[0]
                : chordIntervalCandidates[0];
            // console.log("index: " + scaleNote.index + ", isScaleNote: " + scaleNote.isScaleNote +
            //     ", note: " + scaleNote.label + ", interval: " + scaleNote.intervalName + " -> " + 
            //     getIntervalName(activeInterval) +
            //     ", scaleCount: " + scaleNote.noteNumber + " -> " + scaleCounter[1]);
            return {
                scaleNote: scaleNote,
                chordInterval: activeInterval
            };
        });
    }
    music2.generateNodes = generateNodes;
    function buildScaleCounter(diatonic, startAt) {
        if (startAt === void 0) { startAt = 0; }
        var noteCount = diatonic.filter(function (x) { return x; }).length;
        var i = (noteCount - startAt) % noteCount;
        return diatonic.map(function (isNote) {
            if (isNote) {
                var value = [true, i];
                i = (i + 1) % noteCount;
                return value;
            }
            return [false, 0];
        });
    }
    var romanNumeral = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
    function generateChordNumbers(scaleNotes) {
        return scaleNotes.map(function (scaleNote, i) {
            if (scaleNote.isScaleNote) {
                var roman = romanNumeral[scaleNote.noteNumber];
                var nodes = generateNodes(scaleNotes, scaleNote.index);
                var diminished = "";
                var seventh = "";
                // does it have a diminished 5th?
                if (nodes.some(function (x) { return x.scaleNote.isScaleNote && x.chordInterval.ord === 4 && x.chordInterval.type === IntervalType.Dim; })) {
                    diminished = "°";
                }
                // does it have a major 3rd?
                if (nodes.some(function (x) { return x.scaleNote.isScaleNote && x.chordInterval.ord === 2 && x.chordInterval.type === IntervalType.Maj; })) {
                    roman = roman.toLocaleUpperCase();
                }
                // does it have a natural 7th?
                if (nodes.some(function (x) { return x.scaleNote.isScaleNote && x.chordInterval.ord === 6 && x.chordInterval.type === IntervalType.Min; })) {
                    seventh = "7";
                }
                // does it have a major 7th?
                if (nodes.some(function (x) { return x.scaleNote.isScaleNote && x.chordInterval.ord === 6 && x.chordInterval.type === IntervalType.Maj; })) {
                    seventh = "maj7";
                }
                return roman + diminished + seventh;
            }
            return "";
        });
    }
    music2.generateChordNumbers = generateChordNumbers;
})(music2 || (music2 = {}));
var music;
(function (music) {
    music.noteBases = [
        { id: 0, index: 0, name: 'C' },
        { id: 1, index: 2, name: 'D' },
        { id: 2, index: 4, name: 'E' },
        { id: 3, index: 5, name: 'F' },
        { id: 4, index: 7, name: 'G' },
        { id: 5, index: 9, name: 'A' },
        { id: 6, index: 11, name: 'B' }
    ];
    music.notes = {};
    music.notes["C"] = 0;
    music.notes["D"] = 2;
    music.notes["E"] = 4;
    music.notes["F"] = 5;
    music.notes["G"] = 7;
    music.notes["A"] = 9;
    music.notes["B"] = 11;
    var noteLabels = [
        { offset: 0, label: '' },
        { offset: 1, label: '♯' },
        { offset: 2, label: 'x' },
        { offset: -1, label: '♭' },
        { offset: -2, label: '♭♭' },
    ];
    music.modes = [
        { name: 'Lydian', index: 3 },
        { name: 'Major / Ionian', index: 0 },
        { name: 'Mixolydian', index: 4 },
        { name: 'Dorian', index: 1 },
        { name: 'N Minor / Aeolian', index: 5 },
        { name: 'Phrygian', index: 2 },
        { name: 'Locrian', index: 6 },
    ];
    var scaleTones = [2, 2, 1, 2, 2, 2, 1];
    var romanNumeral = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
    var ChordType;
    (function (ChordType) {
        ChordType[ChordType["Major"] = 0] = "Major";
        ChordType[ChordType["Minor"] = 1] = "Minor";
        ChordType[ChordType["Diminished"] = 2] = "Diminished";
    })(ChordType = music.ChordType || (music.ChordType = {}));
    ;
    ;
    var nullChord = {
        romanNumeral: "",
        triad: [0, 0, 0],
        type: ChordType.Major
    };
    music.nullScaleNote = {
        index: 0,
        degree: 0,
        noteName: "",
        chord: nullChord,
        noteBase: {
            id: 0,
            index: 0,
            name: ""
        },
        offset: 0,
        intervalShort: "",
        intervalLong: ""
    };
    ;
    ;
    // https://en.wikipedia.org/wiki/Interval_(music)
    music.intervals = {};
    // key is "<scale degree>.<semitones>"
    music.intervals["1.0"] = { short: "1", text: "Unison" };
    music.intervals["2.0"] = { short: "d2", text: "Diminished Second" };
    music.intervals["2.1"] = { short: "m2", text: "Minor Second" };
    music.intervals["1.1"] = { short: "A1", text: "Augmented Unison" };
    music.intervals["2.2"] = { short: "M2", text: "Major Second" };
    music.intervals["3.2"] = { short: "d3", text: "Diminished Third" };
    music.intervals["3.3"] = { short: "m3", text: "Minor Third" };
    music.intervals["2.3"] = { short: "A2", text: "Augmented Second" };
    music.intervals["3.4"] = { short: "M3", text: "Major Third" };
    music.intervals["4.4"] = { short: "d4", text: "Diminished Fourth" };
    music.intervals["4.5"] = { short: "4", text: "Perfect Fourth" };
    music.intervals["3.5"] = { short: "A3", text: "Augmented Third" };
    music.intervals["5.6"] = { short: "d5", text: "Diminished Fifth" };
    music.intervals["4.6"] = { short: "A4", text: "Augmented Fourth" };
    music.intervals["5.7"] = { short: "5", text: "Perfect Fifth" };
    music.intervals["6.7"] = { short: "d6", text: "Diminished Sixth" };
    music.intervals["6.8"] = { short: "m6", text: "Minor Sixth" };
    music.intervals["5.8"] = { short: "A5", text: "Augmented Fifth" };
    music.intervals["6.9"] = { short: "M6", text: "Major Sixth" };
    music.intervals["7.9"] = { short: "d7", text: "Diminished Seventh" };
    music.intervals["7.10"] = { short: "m7", text: "Minor Seventh" };
    music.intervals["6.10"] = { short: "A6", text: "Augmented Sixth" };
    music.intervals["7.11"] = { short: "M7", text: "Major Seventh" };
    music.intervals["8.11"] = { short: "d8", text: "Diminished Octave" };
    function generateScale(noteBase, index, mode) {
        var scale = [];
        var currentIndex = index;
        var currentNoteBase = noteBase;
        var _loop_1 = function (i) {
            var offset = currentIndex - currentNoteBase.index;
            if (Math.abs(offset) > 2) {
                offset = (currentIndex < currentNoteBase.index)
                    ? (currentIndex + 12) - currentNoteBase.index
                    : currentIndex - (currentNoteBase.index + 12);
            }
            // lookup noteLabel with offset
            var noteLabel = noteLabels.filter(function (n) { return n.offset == offset; })[0];
            // find interval
            var noteInterval = music.intervals[(i + 1) + "." + findInterval(index, currentIndex)];
            // add new ScaleNote to scale
            scale.push({
                index: currentIndex,
                degree: i,
                noteName: currentNoteBase.name + noteLabel.label,
                noteBase: currentNoteBase,
                offset: offset,
                intervalShort: noteInterval.short,
                intervalLong: noteInterval.text,
                chord: nullChord
            });
            var interval = scaleTones[(mode.index + i) % 7];
            currentIndex = (currentIndex + interval) % 12;
            currentNoteBase = music.noteBases[(currentNoteBase.id + 1) % 7];
        };
        for (var i = 0; i < 7; i++) {
            _loop_1(i);
        }
        var scalePlusChord = [];
        for (var _i = 0, scale_1 = scale; _i < scale_1.length; _i++) {
            var note = scale_1[_i];
            scalePlusChord.push({
                index: note.index,
                degree: note.degree,
                noteName: note.noteName,
                noteBase: note.noteBase,
                offset: note.offset,
                intervalShort: note.intervalShort,
                intervalLong: note.intervalLong,
                chord: generateChord(scale, note)
            });
        }
        return scalePlusChord;
    }
    music.generateScale = generateScale;
    function generateChord(scale, root) {
        var triad = [
            root.index,
            scale[(root.degree + 2) % 7].index,
            scale[(root.degree + 4) % 7].index
        ];
        var chordType = getChordType(triad);
        var roman = romanNumeral[root.degree];
        if (chordType === ChordType.Major) {
            roman = roman.toLocaleUpperCase();
        }
        if (chordType === ChordType.Diminished) {
            roman = roman + "°";
        }
        return {
            romanNumeral: roman,
            triad: triad,
            type: chordType
        };
    }
    function appendTriad(scale, chordIndex) {
        var chord = scale.filter(function (x) { return x.index == chordIndex; })[0].chord;
        for (var _i = 0, scale_2 = scale; _i < scale_2.length; _i++) {
            var note = scale_2[_i];
            for (var i = 0; i < 3; i++) {
                if (note.index === chord.triad[i]) {
                    note.chordNote = i;
                }
            }
        }
        return scale;
    }
    music.appendTriad = appendTriad;
    function fifths() {
        var indexes = [];
        var current = 0;
        for (var i = 0; i < 12; i++) {
            indexes.push(current);
            current = (current + 7) % 12;
        }
        return indexes;
    }
    music.fifths = fifths;
    function chromatic() {
        var indexes = [];
        for (var i = 0; i < 12; i++) {
            indexes.push(i);
        }
        return indexes;
    }
    music.chromatic = chromatic;
    function getChordType(triad) {
        // check for diminished
        if (findInterval(triad[0], triad[2]) === 6)
            return ChordType.Diminished;
        // check for minor
        if (findInterval(triad[0], triad[1]) === 3)
            return ChordType.Minor;
        // must be Major
        return ChordType.Major;
    }
    function findInterval(a, b) {
        return (a <= b) ? b - a : (b + 12) - a;
    }
    function indexIsNatural(index) {
        return music.noteBases.filter(function (noteBase, i, a) {
            return noteBase.index == index;
        }).length != 0;
    }
    music.indexIsNatural = indexIsNatural;
})(music || (music = {}));
var state;
(function (state) {
    var currentMode = music.modes[1];
    var currentNoteBase = music.noteBases[0];
    var currentIndex = 0;
    var currentChordIndex = -1;
    function init() {
        var cookieData = cookies.readCookie();
        if (cookieData.hasCookie) {
            currentIndex = cookieData.index;
            currentNoteBase = music.noteBases[cookieData.noteBaseIndex];
            currentMode = music.modes.filter(function (x) { return x.index == cookieData.modeIndex; })[0];
            currentChordIndex = cookieData.chordIndex;
        }
        // lets remember this while we reset everything.
        var tempChordIndex = currentChordIndex;
        events.tonicChange.subscribe(tonicChanged);
        events.modeChange.subscribe(modeChanged);
        events.chordChange.subscribe(chordChanged);
        events.tonicChange.publish({ index: currentIndex, newNoteBase: currentNoteBase });
        events.modeChange.publish({ mode: currentMode });
        events.chordChange.publish({ chordIndex: tempChordIndex });
    }
    state.init = init;
    function tonicChanged(tonicChangedEvent) {
        currentNoteBase = tonicChangedEvent.newNoteBase;
        currentIndex = tonicChangedEvent.index;
        currentChordIndex = -1;
        updateScale();
    }
    function modeChanged(modeChangedEvent) {
        currentMode = modeChangedEvent.mode;
        currentChordIndex = -1;
        updateScale();
    }
    function chordChanged(chordChangedEvent) {
        if (chordChangedEvent.chordIndex == currentChordIndex) {
            currentChordIndex = -1;
        }
        else {
            currentChordIndex = chordChangedEvent.chordIndex;
        }
        updateScale();
    }
    function updateScale() {
        var scale = music.generateScale(currentNoteBase, currentIndex, currentMode);
        var nodes = music2.generateScaleShim(currentNoteBase, currentIndex, currentMode);
        if (currentChordIndex != -1) {
            scale = music.appendTriad(scale, currentChordIndex);
        }
        events.scaleChange.publish({
            mode: currentMode,
            noteBase: currentNoteBase,
            index: currentIndex,
            scale2: scale,
            chordIndex: currentChordIndex
        });
    }
})(state || (state = {}));
var cof;
(function (cof_1) {
    var NoteCircle = (function () {
        function NoteCircle(svg, noteIndexes, label) {
            this.indexer = function (x) { return x.index + ""; };
            var pad = 50;
            var chordRadius = 240;
            var noteRadius = 200;
            var degreeRadius = 135;
            var innerRadius = 90;
            var cof = svg
                .append("g")
                .attr("transform", "translate(" + (noteRadius + pad) + ", " + (noteRadius + pad) + ")");
            cof.append("text")
                .attr("text-anchor", "middle")
                .attr("x", 0)
                .attr("y", 0)
                .text(label);
            var segments = generateSegments(noteIndexes);
            var noteArc = d3.svg.arc()
                .innerRadius(degreeRadius)
                .outerRadius(noteRadius);
            var degreeArc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(degreeRadius);
            var chordArc = d3.svg.arc()
                .innerRadius(noteRadius)
                .outerRadius(chordRadius);
            this.noteSegments = cof.append("g").selectAll("path")
                .data(segments, this.indexer)
                .enter()
                .append("path")
                .attr("d", noteArc)
                .attr("class", "note-segment")
                .on("click", handleNoteClick);
            this.noteText = cof.append("g").selectAll("text")
                .data(segments)
                .enter()
                .append("text")
                .attr("x", function (x) { return noteArc.centroid(x)[0]; })
                .attr("y", function (x) { return noteArc.centroid(x)[1] + 11; })
                .text("")
                .attr("class", "note-segment-text");
            this.intervalSegments = cof.append("g").selectAll("path")
                .data(segments, this.indexer)
                .enter()
                .append("path")
                .attr("d", degreeArc)
                .attr("class", "degree-segment");
            this.intervalText = cof.append("g").selectAll("text")
                .data(segments, this.indexer)
                .enter()
                .append("text")
                .attr("x", function (x) { return degreeArc.centroid(x)[0]; })
                .attr("y", function (x) { return degreeArc.centroid(x)[1] + 8; })
                .text("")
                .attr("class", "degree-segment-text");
            this.chordSegments = cof.append("g").selectAll("path")
                .data(segments, this.indexer)
                .enter()
                .append("path")
                .attr("d", chordArc)
                .attr("class", "chord-segment")
                .on("click", handleChordClick);
            this.chordNotes = cof.append("g").selectAll("circle")
                .data(segments, this.indexer)
                .enter()
                .append("circle")
                .style("pointer-events", "none")
                .attr("r", 25)
                .attr("cx", function (x) { return chordArc.centroid(x)[0]; })
                .attr("cy", function (x) { return chordArc.centroid(x)[1]; })
                .attr("class", "chord-segment-note");
            this.chordText = cof.append("g").selectAll("text")
                .data(segments, this.indexer)
                .enter()
                .append("text")
                .attr("x", function (x) { return chordArc.centroid(x)[0]; })
                .attr("y", function (x) { return chordArc.centroid(x)[1] + 8; })
                .text("")
                .attr("class", "degree-segment-text");
            var instance = this;
            events.scaleChange.subscribe(function (stateChange) {
                instance.update(stateChange);
            });
        }
        NoteCircle.prototype.update = function (stateChange) {
            var data = [];
            for (var _i = 0, _a = stateChange.scale2; _i < _a.length; _i++) {
                var n = _a[_i];
                data.push({
                    startAngle: 0,
                    endAngle: 0,
                    scaleNote: n,
                    index: n.index
                });
            }
            this.noteSegments
                .data(data, this.indexer)
                .attr("class", function (d, i) { return "note-segment " + ((i === 0) ? "note-segment-tonic" : "note-segment-scale"); })
                .exit()
                .attr("class", "note-segment");
            this.noteText
                .data(data, this.indexer)
                .text(function (d) { return d.scaleNote.noteName; })
                .exit()
                .text("");
            this.intervalSegments
                .data(data, this.indexer)
                .attr("class", "degree-segment-selected")
                .exit()
                .attr("class", "degree-segment");
            this.intervalText
                .data(data, this.indexer)
                .text(function (d, i) { return d.scaleNote.intervalShort; })
                .exit()
                .text("");
            this.chordText
                .data(data, this.indexer)
                .text(function (d, i) { return d.scaleNote.chord.romanNumeral; })
                .exit()
                .text("");
            this.chordSegments
                .data(data, this.indexer)
                .attr("class", function (d, i) { return getChordSegmentClass(d.scaleNote); })
                .exit()
                .attr("class", "chord-segment");
            this.chordNotes
                .data(data, this.indexer)
                .attr("class", function (d, i) { return getChordNoteClass(d.scaleNote); })
                .exit()
                .attr("class", "chord-segment-note");
        };
        return NoteCircle;
    }());
    cof_1.NoteCircle = NoteCircle;
    function getChordSegmentClass(note) {
        if (note.chord.type === music.ChordType.Diminished)
            return "chord-segment-dim";
        if (note.chord.type === music.ChordType.Minor)
            return "chord-segment-minor";
        if (note.chord.type === music.ChordType.Major)
            return "chord-segment-major";
        throw "Unexpected ChordType";
    }
    function getChordNoteClass(note) {
        if (note.chordNote === undefined)
            return "chord-segment-note";
        if (note.chordNote === 0)
            return "chord-segment-note-root";
        if (note.chordNote === 1)
            return "chord-segment-note-third";
        return "chord-segment-note-fifth";
    }
    function generateSegments(fifths) {
        var count = fifths.length;
        var items = [];
        var angle = (Math.PI * (2 / count));
        for (var i = 0; i < count; i++) {
            var itemAngle = (angle * i) - (angle / 2);
            items.push({
                startAngle: itemAngle,
                endAngle: itemAngle + angle,
                scaleNote: music.nullScaleNote,
                index: fifths[i]
            });
        }
        return items;
    }
    function handleNoteClick(segment, i) {
        var noteBase = segment.scaleNote.noteBase;
        if (Math.abs(segment.scaleNote.offset) > 1) {
            noteBase = music.noteBases.filter(function (x) { return x.index === segment.scaleNote.index; })[0];
            if (noteBase === undefined) {
                noteBase =
                    music.noteBases.filter(function (x) { return x.index === (segment.scaleNote.index + (segment.scaleNote.offset > 0 ? -1 : 1)); })[0];
            }
        }
        events.tonicChange.publish({
            newNoteBase: noteBase,
            index: segment.scaleNote.index
        });
    }
    function handleChordClick(segment, i) {
        events.chordChange.publish({ chordIndex: segment.scaleNote.index });
    }
})(cof || (cof = {}));
var tonics;
(function (tonics_1) {
    var buttons;
    ;
    function bg(noteBase) {
        var flatIndex = noteBase.index == 0 ? 11 : noteBase.index - 1;
        var sharpIndex = (noteBase.index + 1) % 12;
        return [
            { noteBase: noteBase, label: noteBase.name + "♭", index: flatIndex, greyOut: music.indexIsNatural(flatIndex) },
            { noteBase: noteBase, label: noteBase.name + "", index: noteBase.index, greyOut: false },
            { noteBase: noteBase, label: noteBase.name + "♯", index: sharpIndex, greyOut: music.indexIsNatural(sharpIndex) }
        ];
    }
    function init() {
        var pad = 5;
        var buttonHeight = 25;
        var svg = d3.select("#modes");
        var tonics = svg.append("g");
        var gs = tonics.selectAll("g")
            .data(music.noteBases)
            .enter()
            .append("g")
            .attr("transform", function (d, i) { return "translate(0, " + (i * (buttonHeight + pad) + pad) + ")"; })
            .selectAll("g")
            .data(function (d) { return bg(d); }, indexer)
            .enter()
            .append("g")
            .attr("transform", function (d, i) { return "translate(" + (i * 55) + ", 0)"; });
        buttons = gs
            .append("rect")
            .attr("x", pad)
            .attr("y", 0)
            .attr("strokeWidth", 2)
            .attr("width", 40)
            .attr("height", 25)
            .attr("class", function (d) { return d.greyOut ? "tonic-button tonic-button-grey" : "tonic-button"; })
            .on("click", function (d, i) { return events.tonicChange.publish({
            newNoteBase: d.noteBase,
            index: d.index
        }); });
        gs
            .append("text")
            .attr("x", pad + 10)
            .attr("y", 17)
            .text(function (x) { return x.label; })
            .attr("class", "tonic-text");
        events.scaleChange.subscribe(listener);
    }
    tonics_1.init = init;
    function listener(state) {
        var tonic = state.scale2[0];
        var ds = [{
                noteBase: state.noteBase,
                label: tonic.noteName,
                index: tonic.index,
                greyOut: (state.noteBase.index != tonic.index) && music.indexIsNatural(tonic.index)
            }];
        buttons
            .data(ds, indexer)
            .attr("class", "tonic-button tonic-button-selected")
            .exit()
            .attr("class", function (d) { return d.greyOut ? "tonic-button tonic-button-grey" : "tonic-button"; });
    }
    function indexer(d) {
        return d.label;
    }
})(tonics || (tonics = {}));
var modes;
(function (modes_1) {
    var buttons;
    function init() {
        var pad = 5;
        var buttonHeight = 25;
        var svg = d3.select("#modes");
        var modes = svg
            .append("g")
            .attr("transform", "translate(0, 250)");
        var gs = modes.selectAll("g")
            .data(music.modes, function (m) { return m.index.toString(); })
            .enter()
            .append("g")
            .attr("transform", function (d, i) { return "translate(0, " + (i * (buttonHeight + pad) + pad) + ")"; });
        buttons = gs
            .append("rect")
            .attr("x", pad)
            .attr("y", 0)
            .attr("strokeWidth", 2)
            .attr("width", 150)
            .attr("height", 25)
            .attr("class", "mode-button")
            .on("click", function (d) { return events.modeChange.publish({ mode: d }); });
        gs
            .append("text")
            .attr("x", pad + 10)
            .attr("y", 17)
            .text(function (x) { return x.name; })
            .attr("class", "mode-text");
        events.modeChange.subscribe(update);
    }
    modes_1.init = init;
    function update(modeChange) {
        var modes = [modeChange.mode];
        buttons
            .data(modes, function (m) { return m.index.toString(); })
            .attr("class", "mode-button mode-button-selected")
            .exit()
            .attr("class", "mode-button");
    }
})(modes || (modes = {}));
var gtr;
(function (gtr_1) {
    var currentState;
    var notes;
    var noteLabels;
    var numberOfFrets = 16;
    var fretboardElement;
    var isLeftHanded = false;
    var fretboardLabelType = events.FretboardLabelType.NoteName;
    var stringGap = 40;
    var fretGap = 70;
    var fretWidth = 5;
    var noteRadius = 15;
    var pad = 20;
    var noteColours = [
        "yellow",
        "white",
        "white",
        "white",
        "white",
        "white",
        "white"
    ];
    function indexer(stringNote) {
        return stringNote.index + "_" + stringNote.octave;
    }
    function init() {
        events.tuningChange.subscribe(updateFretboard);
        events.scaleChange.subscribe(update);
        events.leftHandedChange.subscribe(handleLeftHandedChanged);
        events.fretboardLabelChange.subscribe(handleLabelChange);
    }
    gtr_1.init = init;
    function handleLeftHandedChanged(lhEvent) {
        isLeftHanded = lhEvent.isLeftHanded;
        setHandedness();
    }
    function setHandedness() {
        if (isLeftHanded) {
            fretboardElement.transform.baseVal.getItem(0).setTranslate(1200, 0);
            fretboardElement.transform.baseVal.getItem(1).setScale(-1, 1);
            noteLabels
                .attr("transform", function (d, i) { return "translate(0, 0) scale(-1, 1)"; })
                .attr("x", function (d, i) { return -(i * fretGap + pad + 30); });
        }
        else {
            fretboardElement.transform.baseVal.getItem(0).setTranslate(0, 0);
            fretboardElement.transform.baseVal.getItem(1).setScale(1, 1);
            noteLabels
                .attr("transform", function (d, i) { return "translate(0, 0) scale(1, 1)"; })
                .attr("x", function (d, i) { return (i * fretGap + pad + 30); });
        }
    }
    function handleLabelChange(lcEvent) {
        fretboardLabelType = lcEvent.labelType;
        setLabels();
    }
    function setLabels() {
        function setNoteName(note) {
            if (note.scaleNote == null)
                return "";
            return note.scaleNote.noteName;
        }
        function setInterval(note) {
            if (note.scaleNote == null)
                return "";
            return note.scaleNote.intervalShort;
        }
        switch (fretboardLabelType) {
            case events.FretboardLabelType.None:
                noteLabels.text("");
                break;
            case events.FretboardLabelType.NoteName:
                noteLabels.text(setNoteName);
                break;
            case events.FretboardLabelType.Interval:
                noteLabels.text(setInterval);
                break;
        }
    }
    function updateFretboard(tuningInfo) {
        var fretData = getFretData(numberOfFrets);
        var dots = tuningInfo.dots;
        d3.selectAll("#gtr > *").remove();
        var svg = d3.select("#gtr");
        svg.append("text")
            .attr("class", "mode-text")
            .attr("x", 30)
            .attr("y", 10)
            .text(tuningInfo.tuning + " " + tuningInfo.description);
        var gtr = svg.append("g").attr("transform", "translate(0, 0) scale(1, 1)");
        fretboardElement = gtr.node();
        // frets
        gtr.append("g").selectAll("rect")
            .data(fretData)
            .enter()
            .append("rect")
            .attr("x", function (d, i) { return (i + 1) * fretGap + pad - fretWidth; })
            .attr("y", pad + stringGap / 2 - fretWidth)
            .attr("width", fretWidth)
            .attr("height", stringGap * (tuningInfo.notes.length - 1) + (fretWidth * 2))
            .attr("fill", function (d, i) { return i === 0 ? "black" : "none"; })
            .attr("stroke", "grey")
            .attr("stroke-width", 1);
        // dots
        gtr.append("g").selectAll("circle")
            .data(dots)
            .enter()
            .append("circle")
            .attr("r", 10)
            .attr("cx", function (d) { return d[0] * fretGap + pad + 30 + (d[1] * 10); })
            .attr("cy", function (d) { return (tuningInfo.notes.length) * stringGap + pad + 15; })
            .attr("fill", "lightgrey")
            .attr("stroke", "none");
        var strings = gtr.append("g").selectAll("g")
            .data(tuningInfo.notes.slice().reverse(), function (n) { return n + ""; })
            .enter()
            .append("g")
            .attr("transform", function (d, i) { return "translate(0, " + ((i * stringGap) + pad) + ")"; });
        // string lines
        strings
            .append("line")
            .attr("x1", pad + fretGap)
            .attr("y1", stringGap / 2)
            .attr("x2", pad + (fretGap * numberOfFrets) + 20)
            .attr("y2", stringGap / 2)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        notes = strings
            .selectAll("circle")
            .data(function (d) { return allNotesFrom(d, numberOfFrets); }, indexer)
            .enter()
            .append("circle")
            .attr("r", noteRadius)
            .attr("cy", stringGap / 2)
            .attr("cx", function (d, i) { return i * fretGap + pad + 30; })
            .attr("fill", "none")
            .attr("stroke", "none");
        noteLabels = strings
            .selectAll("text")
            .data(function (d) { return allNotesFrom(d, numberOfFrets); }, indexer)
            .enter()
            .append("text")
            .attr("transform", "translate(0, 0) scale(1, 1)")
            .attr("text-anchor", "middle")
            .attr("x", function (d, i) { return i * fretGap + pad + 30; })
            .attr("y", (stringGap / 2) + 5)
            .text("");
        setHandedness();
        if (currentState != null) {
            update(currentState);
        }
    }
    function update(stateChange) {
        var fill = function (d, i) {
            return noteColours[i % 7];
        };
        var stroke = function (d, i) {
            var note = d.scaleNote;
            if (note.chordNote === undefined) {
                return "grey";
            }
            if (note.chordNote === 0) {
                return "red";
            }
            if (note.chordNote === 1) {
                return "green";
            }
            return "blue";
        };
        var strokeWidth = function (d, i) {
            var note = d.scaleNote;
            if (note.chordNote === undefined) {
                return 2;
            }
            return 5;
        };
        var setText = function (d, i) {
            return d.scaleNote.noteName;
        };
        notes
            .data(repeatTo(stateChange.scale2, numberOfFrets), indexer)
            .attr("fill", fill)
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .exit()
            .attr("fill", "none")
            .attr("stroke", "none");
        noteLabels
            .data(repeatTo(stateChange.scale2, numberOfFrets), indexer)
            .text(setText)
            .exit()
            .each(function (d, i) { return d.scaleNote = music.nullScaleNote; })
            .text("");
        currentState = stateChange;
        setLabels();
    }
    function allNotesFrom(index, numberOfNotes) {
        var items = [];
        for (var i = 0; i < numberOfNotes; i++) {
            items.push({
                octave: Math.floor((i + 1) / 12),
                index: (i + index) % 12,
                scaleNote: music.nullScaleNote
            });
        }
        return items;
    }
    function getFretData(numberOfFrets) {
        var data = [];
        for (var i = 0; i < numberOfFrets; i++) {
            data.push(i);
        }
        return data;
    }
    function repeatTo(scale, count) {
        var result = [];
        for (var i = 0; i < count; i++) {
            var note = scale[i % scale.length];
            result.push({
                octave: Math.floor((i + 1) / 8),
                index: note.index,
                scaleNote: note
            });
        }
        return result;
    }
})(gtr || (gtr = {}));
var tuning;
(function (tuning_1) {
    var guitarDots = [
        [3, 0],
        [5, 0],
        [7, 0],
        [9, 0],
        [12, -1],
        [12, 1],
        [15, 0]
    ];
    var tunings = [
        { tuning: "EADGBE", dots: guitarDots, description: "Guitar Standard" },
        { tuning: "DADGBE", dots: guitarDots, description: "Guitar Drop D" },
        { tuning: "DADGAD", dots: guitarDots, description: "Guitar" },
        { tuning: "CGDAEA", dots: guitarDots, description: "Guitar Fripp NST" },
        { tuning: "EADG", dots: guitarDots, description: "Bass Standard" },
        { tuning: "DADG", dots: guitarDots, description: "Bass Drop D" },
        { tuning: "GCEA", dots: guitarDots, description: "Ukulele C" },
        { tuning: "CGDA", dots: guitarDots, description: "Cello" },
        { tuning: "GDAE", dots: guitarDots, description: "Violin" },
        { tuning: "CGDA", dots: guitarDots, description: "Viola" },
    ];
    function parseTuning(tuning) {
        var result = [];
        for (var i = 0; i < tuning.length; i++) {
            var noteChar = tuning.charAt(i);
            if (music.notes[noteChar] != null) {
                result.push(music.notes[noteChar]);
            }
        }
        return result;
    }
    function init() {
        d3.select("#tuning-dropdown")
            .selectAll("div")
            .data(tunings)
            .enter()
            .append("div")
            .attr("class", "dropdown-content-item")
            .on("click", function (x) { return raiseTuningChangedEvent(x); })
            .text(function (x) { return x.tuning + "   " + x.description; });
        raiseTuningChangedEvent(tunings[0]);
    }
    tuning_1.init = init;
    function raiseTuningChangedEvent(info) {
        events.tuningChange.publish({
            tuning: info.tuning,
            dots: info.dots,
            description: info.description,
            notes: parseTuning(info.tuning)
        });
    }
})(tuning || (tuning = {}));
var settings;
(function (settings) {
    function onLeftHandedClick(e) {
        events.leftHandedChange.publish({ isLeftHanded: e.checked });
    }
    settings.onLeftHandedClick = onLeftHandedClick;
    function onFbNoteTextClick(e) {
        events.fretboardLabelChange.publish({ labelType: parseInt(e.value) });
    }
    settings.onFbNoteTextClick = onFbNoteTextClick;
})(settings || (settings = {}));
///<reference path="../node_modules/@types/d3/index.d.ts" />
tonics.init();
modes.init();
var chromatic = new cof.NoteCircle(d3.select("#chromatic"), music.chromatic(), "Chromatic");
var circleOfFifths = new cof.NoteCircle(d3.select("#cof"), music.fifths(), "Circle of Fifths");
gtr.init();
tuning.init();
state.init();
cookies.init();
//# sourceMappingURL=gtr-cof.js.map