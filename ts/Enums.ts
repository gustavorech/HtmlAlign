

namespace HtmlAlign {
    // Enum para definir sobre qual contexto a propriedade CSS será aplicada
    export enum CssPropertyContext { Component = 1, Child = 2 }
    // Enum para definir os valores de visibilidade possíveis
    export enum Scroll { Auto = 1, Visible = 2, None = 3 }
    // Enum para definir os valores de referência lateral possíveis
    export enum Side { Left = 1, Top = 2, Right = 3, Bottom = 4, All = 5 }
    // Enum para definir os valores de alinhamento possíveis (por demensão)
    export enum Align { Start = 1, Center = 2, End = 3, Streach = 4 }
    // Enum para definir os eixos possíveis
    export enum Axis { Horizontal = 1, Vertical = 2 }
    // Enum para os componentes que se adequal ao tamanho
    export enum Fit { Fit = 1, Uniform = 2, Horizontal = 3, Vertical = 4 }
}