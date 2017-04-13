import {AbstractElement} from "./AbstractElement";
import {MoveableModel} from "../race/Moveable";

interface Point {
    x(): number
    y(): number
}

type LineFunction = {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
}

interface Line {
    p1(): Point
    p2(): Point
}

function getLineFunction(line: Line): LineFunction {
    return {
        minX: line.p1().x() < line.p2().x() ? line.p1().x() : line.p2().x(),
        maxX: line.p1().x() > line.p2().x() ? line.p1().x() : line.p2().x(),
        minY: line.p1().y() < line.p2().y() ? line.p1().y() : line.p2().y(),
        maxY: line.p1().y() > line.p2().y() ? line.p1().y() : line.p2().y()
    };
}

export class DynamicPoint implements Line, Point {
    protected  _x: AbstractElement<number>;
    protected _y: AbstractElement<number>;
    protected __p1: { x: number, y: number };
    protected __p2: { x: number, y: number };
    protected _p1: Point;
    protected _p2: Point;
    protected _pProj: Point;

    constructor(x: AbstractElement<number>, y: AbstractElement<number>) {
        this._x = x;
        this._y = y;
        this.__p1 = { x: this._x.get(), y: this._y.get() };
        this.__p2 = { x: this._x.get(), y: this._y.get() };
        this._x.registerCallback(this, (newX: number): void => {
            this.__p1.x = newX;
            this.__p1.y = this._y.get();
            let temp = this.__p2;
            this.__p2 = this.__p1;
            this.__p1 = temp;
        });
        this._y.registerCallback(this, (newY: number): void => {
            this.__p1.y = newY;
            this.__p1.x = this._x.get();
            let temp = this.__p2;
            this.__p2 = this.__p1;
            this.__p1 = temp;
        });
        this._p1 = {
            x: function() { return this.__p1.x; }.bind(this),
            y: function() { return this.__p1.y; }.bind(this)
        };
        this._p2 = {
            x: function() { return this.__p2.x; }.bind(this),
            y: function() { return this.__p2.y; }.bind(this)
        };
        this._pProj = {
            x: function () {
                return this._p2.x() + (this._p2.x() - this._p1.x());
            }.bind(this),
            y: function () {
                return this._p2.y() + (this._p2.y() - this._p1.y());
            }.bind(this)
        }
    }

    x(): number {
        return this._x.get();
    }

    y(): number {
        return this._y.get();
    }

    p1(): Point {
        return this._p2;
    }

    p2(): Point {
        return this._pProj;
    }
}

export enum ExtrudeDirection {
    TOP = 1, // start at one so all values are considered truthy
    RIGHT,
    BOTTOM,
    LEFT
}

export class StaticLine implements Line {
    readonly _p1: DynamicPoint;
    readonly _p2: DynamicPoint;

    constructor(p1: DynamicPoint, p2: DynamicPoint) {
        this._p1 = p1;
        this._p2 = p2;
    }

    p1(): Point {
        return this._p1.p2();
    }

    p2(): Point {
        return this._p2.p2();
    }

    // if there is an intersection, return the extrusion direction of other relative this
    // i.e. if return LEFT, indicates that other extrudes to the left of this
    intersects(other: Line): boolean | ExtrudeDirection {

        let lf = getLineFunction(this);
        let lfO = getLineFunction(other);
        let lfR = lf.minX >= lfO.minX ? lf : lfO;
        let lfL = lfR === lf ? lfO : lf;
        let lfT = lf.minY <= lfO.minY ? lf : lfO;
        let lfB = lfT === lf ? lfO : lf;

        if(lfL.maxX >= lfR.minX
            && lfR.minX <= lfL.maxX
            && lfT.maxY >= lfB.minY
            && lfB.minY <= lfT.maxY) {
            if (lfO.maxY <= lf.maxY && lfO.minY >= lf.minY)
                return lfO === lfL ? ExtrudeDirection.LEFT : ExtrudeDirection.RIGHT;
            else
                return lfO === lfT ? ExtrudeDirection.TOP: ExtrudeDirection.BOTTOM

        }

        return false;
    }
}

export interface Intersectable {
    lines(): StaticLine[];
}

export function intersects(i1: Intersectable, i2: Intersectable): boolean {
    for (let l1 of i1.lines()) {
        for (let l2 of i2.lines()) {
            let result = l1.intersects(l2);
            if (result)
                return true;
        }
    }
    return false;
}

export function enters(intersectable: Intersectable, moveable: MoveableModel): boolean | ExtrudeDirection {
    for (let line of intersectable.lines()) {
        for (let point of moveable.dynamicPoints()) {
            let result = line.intersects(point);
            if (result)
                return result;
        }
    }
    return false;
}

export interface Extrudable {
    extrude(direction: ExtrudeDirection): { x: number, y: number };
}