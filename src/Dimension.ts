/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='Enums.ts'/>
/// <reference path='Interfaces.ts'/>
/// <reference path='ValueTypes.ts'/>

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  export class Dimension {
    public isParentAPanel = true;
    public isVisible = true;
    public scroll = Scroll.none;
    public align = Align.start;
    public size = new SizeRange(0, 0, 0, false, 0, false);
    public margin = new Thickness(0, 0);
    public border = new Thickness(0, 0);
    public padding = new Thickness(0, 0);

    public isComponentDelimiterChanged = false;
    public isComponentDesiredChanged = false;
    public isNeedMeasureAgain = false;
    public isComponentDisplacementChanged = false;
    public isComponentSizeChanged = false;
    public isComponentSpaceChanged = false;

    #actualSize = 0;
    #actualDisplacement = 0;
    #givedDelimiter = new SizeDelimiter(0, 0);
    #componentDelimiter = new SizeDelimiter(0, 0);
    #contentDelimiter = new SizeDelimiter(0, 0);
    #contentDesired = 0;
    #componentDesired = 0;
    #componentRequired = 0;
    #savedComponentDesired = 0;
    #givedSpace = new Space(0, 0);
    #componentSpace = new Space(0, 0);
    #contentSpace = new Space(0, 0);

    constructor(private _axis: Axis) {}

    public get actualSize(): number {
      return this.#actualSize;
    }
    public set actualSize(value: number) {
      this.#actualSize = value;
    }
    public get actualDisplacement(): number {
      return this.#actualDisplacement;
    }
    public set actualDisplacement(value: number) {
      this.#actualDisplacement = value;
    }
    public get componentDelimiter(): SizeDelimiter {
      return this.#componentDelimiter;
    }
    public get contentDelimiter(): SizeDelimiter {
      return this.#contentDelimiter;
    }
    public get componentDesired(): number {
      return this.#componentDesired;
    }
    public get componentRequired(): number {
      return this.#componentRequired;
    }
    public get componentSpace(): Space {
      return this.#componentSpace;
    }
    public get contentSpace(): Space {
      return this.#contentSpace;
    }

    // [TODO] precisa analisar
    // informa se o tamanho dessa dimensão é fixa
    public get isFixed(): boolean {
      return (
        this.size.minIsPercent == this.size.maxIsPercent &&
        this.size.star == 0 &&
        !this.size.minIsPercent &&
        this.size.min == this.size.max
      );
    }

    // [TODO] precisa analisar
    // se o tamanho desejado pelo componente foi modificado ele precisará arranjar novamente os filhos
    // se a delimitação de tamanho foi modificada pelo componente pai e esse componte tem tamanho relativo
    // ao componente pai ele precisará ser rearranjado
    public get needArrange(): boolean {
      return (
        this.isComponentDesiredChanged ||
        (this.isComponentDelimiterChanged &&
          (this.size.minIsPercent ||
            this.size.maxIsPercent ||
            this.size.star > 0 ||
            (this.align === Align.streach &&
              this.size.max === Number.POSITIVE_INFINITY)))
      );
    }

    // [TODO] precisa analisar
    public get star(): number {
      if (!this.isVisible) {
        return 0;
      }

      return this.size.star;
    }

    public get needLayout(): boolean {
      return (
        this.#actualSize !== this.#componentSpace.size ||
        this.#actualDisplacement !== this.#componentSpace.displacement
      );
    }

    // passo 1: behavior informa a delimitação de tamanho
    // componente verifica qual sua delimitação e a do conteúdo
    public get givedDelimiter(): SizeDelimiter {
      return this.#givedDelimiter;
    }
    public set givedDelimiter(value: SizeDelimiter) {
      // inicialização
      this.#givedDelimiter.min = value.min;
      this.#givedDelimiter.max = value.max;
      // salva valores antigos para verificar mudança
      const lastComponentDelimiterMin = this.#componentDelimiter.min;
      const lastComponentDelimiterMax = this.#componentDelimiter.max;

      // se o valor for proporcional ou percentual a margem do componente deve
      // estar incluída no delimitador

      // se for * apenas assume o delimitador entregue pelo componente
      // pai na integra, provavelmente o componente precisará ser medido uma
      // segunda vez
      if (this.size.star > 0) {
        this.#componentDelimiter.copyFrom(this.#givedDelimiter);
      } else if (this.size.delimiter > 0) {
        this.#componentDelimiter.min =
          (this.#givedDelimiter.max * this.size.delimiter) / 100;

        if (this.#componentDelimiter.min < this.size.min) {
          this.#componentDelimiter.min = this.size.min + this.margin.sum();
        } else if (this.#componentDelimiter.min > this.size.max) {
          this.#componentDelimiter.min = this.size.max + this.margin.sum();
        }

        this.#componentDelimiter.max = this.#componentDelimiter.min;
      }
      // se não ou calcula as porcentagens caso as extremidades forem porcentagens
      // ou assume exatamente o que o componente quer
      // se o componente tiver tamanho percentual mínimo pode haver necessidade de uma nova medida
      // se o componente tiver alinhamento streach e o tamanho máximo for infinito
      // pode haver a necessidade de uma nova medida
      // as necessidades de novas medidas são condicionais a ampliação do tamanho do componente
      // pai e isso será conhecido no passo de arranjo
      else {
        if (this.size.minIsPercent) {
          this.#componentDelimiter.min =
            (this.#givedDelimiter.min * this.size.min) / 100;
        } else {
          this.#componentDelimiter.min = this.size.min + this.margin.sum();
        }

        if (this.size.maxIsPercent) {
          this.#componentDelimiter.max =
            (this.#givedDelimiter.max * this.size.max) / 100;
        } else {
          this.#componentDelimiter.max = this.size.max + this.margin.sum();
        }

        if (
          !this.size.minIsPercent &&
          this.size.maxIsPercent &&
          this.#componentDelimiter.max < this.#componentDelimiter.min
        ) {
          this.#componentDelimiter.max = this.#componentDelimiter.min;
        }

        if (
          this.size.minIsPercent &&
          !this.size.maxIsPercent &&
          this.#componentDelimiter.max < this.#componentDelimiter.min
        ) {
          this.#componentDelimiter.min = this.#componentDelimiter.max;
        }
      }

      // o mínimo tem maior precedência, então se por algum motivo o mínimo for
      // maior que o máximo, substitui o tamanho máximo pelo mínimo
      //if (this._componentDelimiter.Min > this._componentDelimiter.Max) {
      //    this._componentDelimiter.Max = this._componentDelimiter.Min;
      //}
      //// caso especial, o mínimo é percentual e o máximo não é percentual
      //else if (this.Size.MinIsPercent && !this.Size.MaxIsPercent) {
      //    this._componentDelimiter.Min = this._componentDelimiter.Max;
      //}

      // se o alinhamento for Streach e não há máximo, e o delimitador máximo passado
      // pelo componente pai não for infinito, e o tamanho mínimo do componente é menor
      // que o tamanho máximo passado pelo delimitador do componente pai
      // tenta reduzir a probabilidade de um novo measure tornando o delimitador
      // mínimo igual ao máximo do delimitador passado
      // faz isso somente se o componente pai é um panel
      if (
        this.isParentAPanel &&
        this.size.star === 0 &&
        this.givedDelimiter.max !== Number.POSITIVE_INFINITY &&
        this.size.max === Number.POSITIVE_INFINITY &&
        this.align === Align.streach &&
        this.#componentDelimiter.min < this.#givedDelimiter.max
      ) {
        this.#componentDelimiter.min = this.#givedDelimiter.max;
      }

      // verifica qual a delimitação do conteúdo que é a delimitação do componente
      // menos seus espaçamentos e borda
      let totalSpacing =
        this.margin.sum() + this.border.sum() + this.padding.sum();
      // se o scroll estiver visivel acrescenta o tamanho do scroll
      if (this.scroll === Scroll.visible) {
        totalSpacing += 17;
      }

      this.#contentDelimiter.max = this.#componentDelimiter.max - totalSpacing;
      this.#contentDelimiter.min = this.#componentDelimiter.min - totalSpacing;

      // ajusta o delimitador do componente se a porcentagem for maior que 100%
      if (this.size.star === 0) {
        if (this.size.minIsPercent && this.size.min > 100) {
          this.#componentDelimiter.min = this.#givedDelimiter.min;
        }

        if (this.size.maxIsPercent && this.size.max > 100) {
          this.#componentDelimiter.max = this.#givedDelimiter.max;
        }
      }

      // verifica mudança e sinaliza caso houve
      this.isComponentDelimiterChanged =
        this.#componentDelimiter.min !== lastComponentDelimiterMin ||
        this.#componentDelimiter.max !== lastComponentDelimiterMax;
    }

    // passo 2: behavior informa, segundo suas regras, qual o tamanho
    // que precisará para o conteúdo
    // componente verifica qual o tamanho desejado e quanto irá requerer
    // do componente pai
    public get contentDesired(): number {
      return this.#contentDesired;
    }
    public set contentDesired(value: number) {
      // inicialização
      this.#contentDesired = value;
      // salva valor antigo para verificar mudança
      const lastComponentDesired = this.#componentRequired;

      // o que o componente deseja é o que o seu conteúdo deseja mais
      // seus espaçamentos
      this.#componentDesired =
        this.#contentDesired +
        this.margin.sum() +
        this.border.sum() +
        this.padding.sum();
      // se o scroll estiver visivel acrescenta o tamanho do scroll
      if (this.scroll == Scroll.visible) {
        this.#componentDesired += 17;
      }

      this.#componentRequired = this.#componentDesired;

      // se o pai for um Panel e o tamanho máximo for percentual
      // informa o tamanho máximo já incluindo a porcentagem
      if (this.isParentAPanel && this.size.maxIsPercent) {
        // salva o valor desejado correto e verifica pelo mínimo
        this.#savedComponentDesired = this.#componentRequired;
        if (this.#savedComponentDesired < this.#componentDelimiter.min) {
          this.#savedComponentDesired = this.#componentDelimiter.min;
        }

        this.#componentRequired =
          (this.#componentRequired * 100) / this.size.max;
      }

      // verifica o delimitador desejado pelo componente, um componente nunca deseja mais que
      // o seu delimitador
      if (this.#componentRequired < this.#componentDelimiter.min) {
        this.#componentRequired = this.#componentDelimiter.min;
      } else if (this.#componentRequired > this.#componentDelimiter.max) {
        this.#componentRequired = this.#componentDelimiter.max;
      }
      // caso contrário o tamanho já estava no intervalo, mas isso não garante
      // que não seja necessário uma nova medida

      // verifica mudança e sinaliza caso houve
      this.isComponentDesiredChanged =
        this.#componentRequired !== lastComponentDesired;
    }

    // passo 3: behavior informa o espaço final decidido para o componente
    // componente verifica o espaço que irá ocupar conforme seu arranjo
    // componente verifica qual o espaço para o conteúdo
    public get givedSpace(): Space {
      return this.#givedSpace;
    }
    public set givedSpace(value: Space) {
      // inicialização
      this.#givedSpace.size = value.size;
      this.#givedSpace.displacement = value.displacement;
      // salva valores antigos para verificar mudança
      const lastComponentSpaceDisplacement = this.#componentSpace.displacement;
      const lastComponentSpaceSize = this.#componentSpace.size;

      // se for estrela, o valor informado substitui o desejado
      if (this.size.star > 0) {
        this.#componentSpace.size = this.#givedSpace.size;

        if (this.#componentSpace.size !== this.#componentRequired) {
          this.isNeedMeasureAgain = true;
        }
      } else if (this.size.delimiter > 0) {
        this.#componentSpace.size =
          (this.#givedSpace.size * this.size.delimiter) / 100;

        if (this.#componentSpace.size !== this.#componentRequired) {
          this.isNeedMeasureAgain = true;

          if (this.#componentSpace.size < this.size.min) {
            this.#componentSpace.size = this.size.min;
          } else if (this.#componentSpace.size > this.size.max) {
            this.#componentSpace.size = this.size.max;
          }
        }
      }
      // se o componente pai for um Panel refaz as validações por mínimos e máximos percentuais
      else if (this.isParentAPanel) {
        // garante que o tamanho máximo percentual seja respeitado
        if (this.size.maxIsPercent) {
          this.componentSpace.size = this.#savedComponentDesired;

          // se o mínimo não for percentual e o tamanho dado está igual ao mínimo
          // respeita esse tamanho
          if (
            this.componentSpace.size !== this.componentDelimiter.min ||
            this.size.minIsPercent
          ) {
            const maxSize = (this.#givedSpace.size * this.size.max) / 100;

            if (this.#componentSpace.size > maxSize) {
              this.isNeedMeasureAgain = true;
              this.#componentSpace.size = maxSize;
            }
          }
        } else {
          this.#componentSpace.size = this.#componentRequired;
        }

        // garante que o tamanho mínimo percentual seja respeitado
        if (this.size.minIsPercent) {
          const minSize = (this.#givedSpace.size * this.size.min) / 100;

          if (this.#componentSpace.size < minSize) {
            this.isNeedMeasureAgain = true;
            this.#componentSpace.size = minSize;
          }
        }
      }
      // caso contrário o valor desejado é respeitado
      else {
        this.#componentSpace.size = this.#componentRequired;
      }

      // se o alinhamento for Streach e não há máximo, sempre utiliza todo o espaço
      if (
        this.size.max === Number.POSITIVE_INFINITY &&
        this.align === Align.streach
      ) {
        this.#componentSpace.size = this.#givedSpace.size;

        if (this.#componentSpace.size !== this.#componentRequired) {
          this.isNeedMeasureAgain = true;
        }
      }

      // se tiver scroll nessa dimensão o conteúdo estará sempre visível
      if (
        this.scroll === Scroll.none ||
        this.#givedSpace.size > this.#componentSpace.size
      ) {
        // verifica o distanciamento da origem a partir do alinhamento
        switch (this.align) {
          case Align.center:
            this.#componentSpace.displacement =
              (this.#givedSpace.size - this.#componentSpace.size) / 2;
            break;
          case Align.end:
            this.#componentSpace.displacement =
              this.#givedSpace.size - this.#componentSpace.size;
            break;
          default:
            this.#componentSpace.displacement = 0;
        }
      } else {
        this.#componentSpace.displacement = 0;
      }

      // tira a margem do tamanho do componente
      this.#componentSpace.size -= this.margin.sum();

      // adiciona o distanciamento da origem informado pelo componente pai
      this.#componentSpace.displacement += this.#givedSpace.displacement;

      // atualiza os valores do espaço de conteúdo
      this.#contentSpace.size =
        this.#componentSpace.size - this.border.sum() - this.padding.sum();
      // se o scroll estiver visivel tira o tamanho do scroll
      if (this.scroll === Scroll.visible) {
        this.#contentSpace.size -= 17;
      }
      this.#contentSpace.displacement = this.padding.start;

      // verifica mudança e sinaliza caso houve
      this.isComponentDisplacementChanged =
        this.#componentSpace.displacement !== lastComponentSpaceDisplacement;

      // verifica mudança e sinaliza caso houve
      this.isComponentSizeChanged =
        this.#componentSpace.size !== lastComponentSpaceSize;

      // verifica mudança e sinaliza caso houve
      this.isComponentSpaceChanged =
        this.isComponentDisplacementChanged || this.isComponentSizeChanged;
    }

    // passo 4: popular valores de layout
    public refreshLayout(component: Component): void {
      let dimensionSizeProperty: string;
      let dimensionDisplacementProperty: string;
      if (this._axis === Axis.horizontal) {
        dimensionSizeProperty = 'width';
        dimensionDisplacementProperty = 'left';
      } else {
        dimensionSizeProperty = 'height';
        dimensionDisplacementProperty = 'top';
      }

      if (this.#actualSize !== this.#componentSpace.size) {
        this.#actualSize = this.#componentSpace.size;
        this.#actualSize = this.#actualSize > 0 ? this.#actualSize : 0;
        component.element.style.setProperty(
          dimensionSizeProperty,
          this.#actualSize + 'px'
        );
      }
      if (this.#actualDisplacement !== this.#componentSpace.displacement) {
        this.#actualDisplacement = this.#componentSpace.displacement;
        this.#actualDisplacement =
          this.#actualDisplacement > 0 ? this.#actualDisplacement : 0;
        component.element.style.setProperty(
          dimensionDisplacementProperty,
          this.#actualDisplacement + 'px'
        );
      }
    }
  }
}
