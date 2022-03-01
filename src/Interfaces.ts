// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  export interface ICssProperty {
    name: string;
    context: CssPropertyContext;
    defaultValue(): string;
    setValueFromCssProperty(valueString: string, component: Component);
    getValueStringFromComponent(component: Component): string;
  }

  export interface IBehavior {
    name: string;
    component: Component;
    isLayoutOverridedInArrange: boolean;
    getNew(): IBehavior;
    getCssProperties(): ICssProperty[];
    measure(): void;
    arrange(): void;
  }

  // Interface para as classes que representam grupos de valores, como se fossem
  // uma struct em C#. Quando esses valores fossem passados por métodos eles deveriam
  // ir por cópia, mas como não há estrutura semelhante em javascript deve-se tomar bastante
  // cuidado para que dois objetos não referenciem o mesmo IValueType
  export interface IValueType {
    copy(): IValueType;
    copyFrom(obj: IValueType): void;
  }

  // Indica que uma classe possuí informações de valores nas duas dimensões (horizontal e vertical).
  // Define métodos para buscar e setar o valor de cada dimensão informando qual dimensão pelo enum
  // Axis
  export interface ITwoDimensionalSet<T> {
    horizontal: T;
    vertical: T;

    getOnAxis(axis: Axis): T;
    getPerpendicularToAxis(axis: Axis): T;
    setOnAxis(axis: Axis, value: T): void;
    setPerpendicularToAxis(axis: Axis, value: T): void;
  }
}
