// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  // Enum para definir sobre qual contexto a propriedade CSS será aplicada
  export enum CssPropertyContext {
    component = 1,
    child = 2
  }
  // Enum para definir os valores de visibilidade possíveis
  export enum Scroll {
    auto = 1,
    visible = 2,
    none = 3
  }
  // Enum para definir os valores de referência lateral possíveis
  export enum Side {
    left = 1,
    top = 2,
    right = 3,
    bottom = 4,
    all = 5
  }
  // Enum para definir os valores de alinhamento possíveis (por demensão)
  export enum Align {
    start = 1,
    center = 2,
    end = 3,
    streach = 4
  }
  // Enum para definir os eixos possíveis
  export enum Axis {
    horizontal = 1,
    vertical = 2
  }
  // Enum para os componentes que se adequal ao tamanho
  export enum Fit {
    fit = 1,
    uniform = 2,
    horizontal = 3,
    vertical = 4
  }
}
