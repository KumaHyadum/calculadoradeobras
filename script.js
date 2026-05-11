const money = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});

const number = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const oneDecimal = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
});

function value(form, name) {
    return Number(form.elements[name]?.value || 0);
}

function ceil(valueToRound) {
    return Math.ceil(valueToRound || 0);
}

function formatMeasure(valueToFormat, suffix) {
    return `${number.format(valueToFormat || 0)} ${suffix}`;
}

function formatOneDecimal(valueToFormat, suffix) {
    return `${oneDecimal.format(valueToFormat || 0)} ${suffix}`;
}

function setListResult(containerId, values) {
    const container = document.querySelector(`#${containerId} .result-list`);
    const rows = container.querySelectorAll("p");

    values.forEach((result, index) => {
        rows[index].querySelector("strong").textContent = result;
    });
}

function concreteMaterials(volume) {
    const cimento = volume * 7;
    const areia = volume * 0.5;
    const brita = volume * 0.8;
    const agua = volume * 180;

    return { cimento, areia, brita, agua };
}

function concreteCosts(form, materials) {
    const custoCimento = materials.cimento * value(form, "precoCimento");
    const custoAreia = materials.areia * value(form, "precoAreia");
    const custoBrita = materials.brita * value(form, "precoBrita");
    const custoAgua = materials.agua * value(form, "precoAgua");
    const total = custoCimento + custoAreia + custoBrita + custoAgua;

    return { custoCimento, custoAreia, custoBrita, custoAgua, total };
}

function showFundacao(form) {
    const volume = value(form, "comprimento") * value(form, "largura") * value(form, "altura");
    const materials = concreteMaterials(volume);
    const costs = concreteCosts(form, materials);

    setListResult("resultado-fundacao", [
        formatMeasure(volume, "m3"),
        formatOneDecimal(materials.cimento, "sacos"),
        formatMeasure(materials.areia, "m3"),
        formatMeasure(materials.brita, "m3"),
        formatOneDecimal(materials.agua, "L"),
        money.format(costs.custoCimento),
        money.format(costs.custoAreia),
        money.format(costs.custoBrita),
        money.format(costs.custoAgua),
        money.format(costs.total)
    ]);
}

function showConcreto(form) {
    const volumeLaje = value(form, "lajeComprimento") * value(form, "lajeLargura") * value(form, "lajeEspessura");
    const volumeViga = value(form, "vigaComprimento") * value(form, "vigaLargura") * value(form, "vigaAltura");
    const volumePilar = value(form, "pilarLargura") * value(form, "pilarProfundidade") * value(form, "pilarAltura");
    const total = volumeLaje + volumeViga + volumePilar;
    const materials = concreteMaterials(total);
    const costs = concreteCosts(form, materials);

    setListResult("resultado-concreto", [
        formatMeasure(volumeLaje, "m3"),
        formatMeasure(volumeViga, "m3"),
        formatMeasure(volumePilar, "m3"),
        formatMeasure(total, "m3"),
        formatOneDecimal(materials.cimento, "sacos"),
        formatMeasure(materials.areia, "m3"),
        formatMeasure(materials.brita, "m3"),
        formatOneDecimal(materials.agua, "L"),
        money.format(costs.custoCimento),
        money.format(costs.custoAreia),
        money.format(costs.custoBrita),
        money.format(costs.custoAgua),
        money.format(costs.total)
    ]);
}

function showAlvenaria(form) {
    const area = value(form, "comprimento") * value(form, "altura");
    const tijolos = area * value(form, "tijolosMetro");
    const tijolosComPerda = ceil(tijolos * 1.1);
    const custo = tijolosComPerda * value(form, "preco");

    setListResult("resultado-alvenaria", [
        formatMeasure(area, "m2"),
        `${ceil(tijolos)} un.`,
        `${tijolosComPerda} un.`,
        money.format(custo)
    ]);
}

function showRevestimento(form) {
    const area = value(form, "comprimentoArea") * value(form, "larguraArea");
    const areaPeca = value(form, "comprimentoPeca") * value(form, "larguraPeca");
    const pecasPorCaixa = value(form, "pecasCaixa");
    const pecas = areaPeca > 0 ? area / areaPeca : 0;
    const pecasComPerda = ceil(pecas * 1.1);
    const caixas = pecasPorCaixa > 0 ? ceil(pecasComPerda / pecasPorCaixa) : 0;
    const custo = caixas * value(form, "precoCaixa");

    setListResult("resultado-revestimento", [
        formatMeasure(area, "m2"),
        `${ceil(pecas)} un.`,
        `${pecasComPerda} un.`,
        `${caixas}`,
        money.format(custo)
    ]);
}

function showPintura(form) {
    const areaTotal = value(form, "areaParedes");
    const areaPortas = value(form, "areaPortas");
    const areaJanelas = value(form, "areaJanelas");
    const rendimento = value(form, "rendimento");
    const areaLiquida = Math.max(areaTotal - areaPortas - areaJanelas, 0);
    const litros = rendimento > 0 ? areaLiquida / rendimento : 0;
    const custo = litros * value(form, "precoLitro");

    setListResult("resultado-pintura", [
        formatMeasure(areaLiquida, "m2"),
        formatMeasure(litros, "L"),
        money.format(custo)
    ]);
}

const calculators = {
    fundacao: showFundacao,
    concreto: showConcreto,
    alvenaria: showAlvenaria,
    revestimento: showRevestimento,
    pintura: showPintura
};

document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".tab-button").forEach((tab) => tab.classList.remove("active"));
        document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));

        button.classList.add("active");
        document.getElementById(button.dataset.target).classList.add("active");
    });
});

document.querySelectorAll("form[data-calculator]").forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        calculators[form.dataset.calculator](form);
    });

    form.addEventListener("reset", () => {
        setTimeout(() => calculators[form.dataset.calculator](form));
    });
});
