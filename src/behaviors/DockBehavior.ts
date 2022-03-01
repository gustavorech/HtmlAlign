/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  export class DockCssProperty implements ICssProperty {
    private regExpString = /^\s*(\w*).*$/;

    public name = '--dock';
    public context = CssPropertyContext.child;

    public defaultValue(): string {
      return 'left';
    }

    public setValueFromCssProperty(_valueString: string, component: Component) {
      const valueString: string = this.regExpString.exec(_valueString)[1];

      if (valueString == 'top') component.parentAttached['Side'] = Side.top;
      else if (valueString == 'right')
        component.parentAttached['Side'] = Side.right;
      else if (valueString == 'bottom')
        component.parentAttached['Side'] = Side.bottom;
      else if (valueString == 'left')
        component.parentAttached['Side'] = Side.left;
      else component.parentAttached['Side'] = Side.all;
    }

    public getValueStringFromComponent(component: Component): string {
      if (component.parentAttached['Side'] == Side.top) return 'top';
      else if (component.parentAttached['Side'] == Side.right) return 'right';
      else if (component.parentAttached['Side'] == Side.bottom) return 'bottom';
      else if (component.parentAttached['Side'] == Side.left) return 'left';
      else return 'fit';
    }
  }

  export class DockBehavior implements IBehavior {
    public name = 'dock';
    public component: Component;
    public isLayoutOverridedInArrange = false;

    static DockCssPropery = new DockCssProperty();

    public getNew(): DockBehavior {
      return new DockBehavior();
    }

    public getCssProperties(): ICssProperty[] {
      return [DockBehavior.DockCssPropery];
    }

    public measure(): void {
      const totalSumRect = Rect.default();
      const desiredRect = Rect.default();

      for (let index = 0; index < this.component.children.length; index++) {
        const child = this.component.children[index];
        child.measure(
          this.component.horizontal.contentDelimiter,
          this.component.vertical.contentDelimiter
        );

        let axis = Axis.vertical;
        if (
          child.parentAttached['Side'] == Side.left ||
          child.parentAttached['Side'] == Side.right
        ) {
          axis = Axis.horizontal;
        }

        totalSumRect.setOnAxis(
          axis,
          totalSumRect.getOnAxis(axis) + child.getOnAxis(axis).componentRequired
        );

        if (desiredRect.getOnAxis(axis) < totalSumRect.getOnAxis(axis)) {
          desiredRect.setOnAxis(axis, totalSumRect.getOnAxis(axis));
        }

        const maxInAwryAxis =
          child.getPerpendicularToAxis(axis).componentRequired +
          totalSumRect.getPerpendicularToAxis(axis);

        if (desiredRect.getPerpendicularToAxis(axis) < maxInAwryAxis) {
          desiredRect.setPerpendicularToAxis(axis, maxInAwryAxis);
        }

        if (child.parentAttached['Side'] == Side.all) {
          break;
        }
      }

      this.component.horizontal.contentDesired = desiredRect.horizontal;
      this.component.vertical.contentDesired = desiredRect.vertical;
    }

    public arrange(): void {
      const sizeRect = new Rect(
        this.component.horizontal.contentSpace.size,
        this.component.vertical.contentSpace.size
      );
      const displacementRect = new Rect(
        this.component.horizontal.contentSpace.displacement,
        this.component.vertical.contentSpace.displacement
      );

      let clearNext = false;
      for (let index = 0; index < this.component.children.length; index++) {
        const child = this.component.children[index];

        if (clearNext) {
          child.horizontal.givedSpace = Space.default();
          child.vertical.givedSpace = Space.default();

          child.arrange();
          continue;
        }

        if (child.parentAttached['Side'] == Side.all) {
          child.horizontal.givedSpace = new Space(
            displacementRect.horizontal,
            sizeRect.horizontal
          );
          child.vertical.givedSpace = new Space(
            displacementRect.vertical,
            sizeRect.vertical
          );

          child.arrange();

          clearNext = true;
          continue;
        }

        let axis = Axis.vertical;
        if (
          child.parentAttached['Side'] == Side.left ||
          child.parentAttached['Side'] == Side.right
        ) {
          axis = Axis.horizontal;
        }

        let sizeInAxis = child.getOnAxis(axis).componentRequired;
        if (sizeInAxis >= sizeRect.getOnAxis(axis)) {
          sizeInAxis = sizeRect.getOnAxis(axis);
          clearNext = true;
        }

        if (
          !clearNext &&
          (child.parentAttached['Side'] == Side.right ||
            child.parentAttached['Side'] == Side.bottom)
        ) {
          child.getOnAxis(axis).givedSpace = new Space(
            displacementRect.getOnAxis(axis) +
              sizeRect.getOnAxis(axis) -
              sizeInAxis,
            sizeInAxis
          );
        } else {
          child.getOnAxis(axis).givedSpace = new Space(
            displacementRect.getOnAxis(axis),
            sizeInAxis
          );

          displacementRect.setOnAxis(
            axis,
            displacementRect.getOnAxis(axis) + sizeInAxis
          );
        }

        child.getPerpendicularToAxis(axis).givedSpace = new Space(
          displacementRect.getPerpendicularToAxis(axis),
          sizeRect.getPerpendicularToAxis(axis)
        );

        sizeRect.setOnAxis(axis, sizeRect.getOnAxis(axis) - sizeInAxis);

        child.arrange();
      }
    }
  }
}
