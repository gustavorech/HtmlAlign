

namespace HtmlAlign {

    export interface ICssProperty {
        Name: string;
        Context: CssPropertyContext;
        DefaultValue(): string;
        SetValueFromCssProperty(valueString: string, component: Component);
        GetValueStringFromComponent(component: Component): string;
    }

    export interface IBehavior {
        Name: string;
        Component: Component;
        IsLayoutOverridedInArrange: boolean;
        GetNew(): IBehavior;
        GetCssProperties(): ICssProperty[];
        Measure(): void;
        Arrange(): void;
    }

    // Interface para as classes que representam grupos de valores, como se fossem
    // uma struct em C#. Quando esses valores fossem passados por métodos eles deveriam
    // ir por cópia, mas como não há estrutura semelhante em javascript deve-se tomar bastante
    // cuidado para que dois objetos não referenciem o mesmo IValueType
    export interface IValueType {
        Copy(): IValueType;
        CopyFrom(obj: IValueType): void;
    }

    // Indica que uma classe possuí informações de valores nas duas dimensões (horizontal e vertical).
    // Define métodos para buscar e setar o valor de cada dimensão informando qual dimensão pelo enum
    // Axis
    export interface ITwoDimensionalSet<T> {
        H: T;
        V: T;

        Get(axis: Axis): T;
        GetAwry(axis: Axis): T;
        Set(axis: Axis, value: T): void;
        SetAwry(axis: Axis, value: T): void;
    }
}