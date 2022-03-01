/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  export class StackCssProperty implements ICssProperty {
    private regExpString = /^\s*(\w*).*$/;

    public name = '--stack';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return 'left';
    }

    public setValueFromCssProperty(_valueString: string, component: Component) {
      const valueString = this.regExpString.exec(_valueString)[1];

      const stackBehavior: StackBehavior = <StackBehavior>component.behavior;

      if (valueString == 'top') stackBehavior.Side = Side.top;
      else if (valueString == 'right') stackBehavior.Side = Side.right;
      else if (valueString == 'bottom') stackBehavior.Side = Side.bottom;
      else stackBehavior.Side = Side.left;
    }

    public getValueStringFromComponent(component: Component): string {
      const stackBehavior: StackBehavior = <StackBehavior>component.behavior;

      if (stackBehavior.Side == Side.top) return 'top';
      else if (stackBehavior.Side == Side.right) return 'right';
      else if (stackBehavior.Side == Side.bottom) return 'bottom';
      else return 'left';
    }
  }

  export class StackBehavior implements IBehavior {
    public name = 'stack';
    public component: Component;
    public isLayoutOverridedInArrange = false;

    static StackCssProperty: StackCssProperty = new StackCssProperty();

    public getNew(): StackBehavior {
      return new StackBehavior();
    }

    public getCssProperties(): ICssProperty[] {
      return [StackBehavior.StackCssProperty];
    }

    public Side: Side;

    private _totalDesiredSizeNotStarInAxis = 0;
    private _starCountInAxis = 0;

    public measure(): void {
      let axis: Axis = Axis.vertical;
      if (this.Side == Side.left || this.Side == Side.right) {
        axis = Axis.horizontal;
      }

      this._starCountInAxis = 0;
      this._totalDesiredSizeNotStarInAxis = 0;

      let maxSizeInAwryAxis = 0;

      for (let index = 0; index < this.component.children.length; index++) {
        const child = this.component.children[index];
        const dimension = child.getOnAxis(axis);

        child.measure(
          this.component.horizontal.contentDelimiter,
          this.component.vertical.contentDelimiter
        );

        const awryDimension = child.getPerpendicularToAxis(axis);
        if (awryDimension.componentRequired > maxSizeInAwryAxis) {
          maxSizeInAwryAxis = awryDimension.componentRequired;
        }

        if (dimension.star > 0) {
          this._starCountInAxis += dimension.star;
        } else {
          this._totalDesiredSizeNotStarInAxis += dimension.componentRequired;
        }
      }

      this.component.getOnAxis(axis).contentDesired =
        this._totalDesiredSizeNotStarInAxis;
      this.component.getPerpendicularToAxis(axis).contentDesired =
        maxSizeInAwryAxis;
    }

    public arrange(): void {
      let axis: Axis = Axis.vertical;
      if (this.Side == Side.left || this.Side == Side.right) {
        axis = Axis.horizontal;
      }

      const spaceInAxis: Space = this.component
        .getOnAxis(axis)
        .contentSpace.copy();
      const spacePerpendicularOfAxis: Space =
        this.component.getPerpendicularToAxis(axis).contentSpace;

      let starPortionSize = 0;
      if (
        this._starCountInAxis > 0 &&
        spaceInAxis.size > this._totalDesiredSizeNotStarInAxis
      ) {
        starPortionSize =
          (spaceInAxis.size - this._totalDesiredSizeNotStarInAxis) /
          this._starCountInAxis;
      }

      if (this.Side == Side.left || this.Side == Side.top) {
        for (let index = 0; index < this.component.children.length; index++) {
          const child: Component = this.component.children[index];
          const dimension = child.getOnAxis(axis);

          if (dimension.star) {
            spaceInAxis.size = starPortionSize * dimension.star;
          } else {
            spaceInAxis.size = dimension.componentRequired;
          }

          dimension.givedSpace = spaceInAxis;
          child.getPerpendicularToAxis(axis).givedSpace =
            spacePerpendicularOfAxis;

          child.arrange();

          spaceInAxis.displacement += spaceInAxis.size;
        }
      } else {
        for (
          let index = this.component.children.length - 1;
          index >= 0;
          index--
        ) {
          const child: Component = this.component.children[index];
          const dimension = child.getOnAxis(axis);

          if (dimension.star) {
            spaceInAxis.size = starPortionSize;
          } else {
            spaceInAxis.size = dimension.componentRequired;
          }

          dimension.givedSpace = spaceInAxis;
          child.getPerpendicularToAxis(axis).givedSpace =
            spacePerpendicularOfAxis;

          child.arrange();

          spaceInAxis.displacement += spaceInAxis.size;
        }
      }
    }
  }
}
