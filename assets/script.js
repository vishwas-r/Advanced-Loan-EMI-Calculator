var loanDefaults = {
	home: {
		minAmount: 500000,
		maxAmount: 10000000,
		defaultAmount: 2500000,
		minRate: 6.5,
		maxRate: 12,
		defaultRate: 8.5,
		minTerm: 5,
		maxTerm: 30,
		defaultTerm: 20,
		tips: ["Aim for a down payment of at least 20% to avoid PMI.", "EMIs should ideally not exceed 30% of your monthly income.", "Consider prepayment options to reduce overall interest.", "Check for processing fees and hidden charges."]
	},
	car: {
		minAmount: 100000,
		maxAmount: 2000000,
		defaultAmount: 800000,
		minRate: 7,
		maxRate: 15,
		defaultRate: 9.5,
		minTerm: 1,
		maxTerm: 7,
		defaultTerm: 5,
		tips: ["Consider a higher down payment to reduce interest costs.", "Check for manufacturer financing deals or cashback offers.", "Remember to factor in insurance and maintenance costs.", "Some lenders offer lower rates for new vehicles compared to used ones."]
	},
	personal: {
		minAmount: 50000,
		maxAmount: 1500000,
		defaultAmount: 500000,
		minRate: 10,
		maxRate: 24,
		defaultRate: 14,
		minTerm: 1,
		maxTerm: 5,
		defaultTerm: 3,
		tips: ["Check your credit score before applying - higher scores get better rates.", "Compare offers from multiple lenders including banks and NBFCs.", "Avoid taking multiple personal loans simultaneously.", "Some lenders offer lower rates for existing customers."]
	},
	education: {
		minAmount: 100000,
		maxAmount: 5000000,
		defaultAmount: 1500000,
		minRate: 7,
		maxRate: 15,
		defaultRate: 8.5,
		minTerm: 3,
		maxTerm: 15,
		defaultTerm: 8,
		tips: ["Many education loans offer moratorium periods until course completion.", "Interest paid on education loans qualifies for tax benefits under Section 80E.", "Some institutions have tie-ups with banks for preferential rates.", "Consider future earning potential when deciding loan amount."]
	},
	business: {
		minAmount: 500000,
		maxAmount: 10000000,
		defaultAmount: 2000000,
		minRate: 9,
		maxRate: 18,
		defaultRate: 12,
		minTerm: 1,
		maxTerm: 10,
		defaultTerm: 5,
		tips: ["Prepare a detailed business plan to improve loan approval chances.", "Consider secured loans for lower interest rates.", "Check for government schemes supporting small businesses.", "Interest paid on business loans is tax-deductible as a business expense."]
	}
};

var loanTypeButtons = document.querySelectorAll(".loan-type-btn");
var loanAmountInput = document.getElementById("loan-amount");
var interestRateInput = document.getElementById("interest-rate");
var loanTermInput = document.getElementById("loan-term");
var paymentTypeSelect = document.getElementById("payment-type");
var calculateBtn = document.getElementById("calculate-btn");
var amountSlider = document.getElementById("amount-slider");
var interestSlider = document.getElementById("interest-slider");
var termSlider = document.getElementById("term-slider");
var tipsContainer = document.querySelector(".tips-list");
var currentLoanType = "home";
var amortizationChart;
var comparisonChart;
var breakdownChart;

loanTypeButtons.forEach((button) => {
	button.addEventListener("click", function () {
		loanTypeButtons.forEach((btn) => btn.classList.remove("active"));
		this.classList.add("active");
		currentLoanType = this.dataset.type;
		updateInputDefaults(currentLoanType);
		updateTips(currentLoanType);
		calculateEMI();
	});
});

function updateInputDefaults(loanType) {
	var defaults = loanDefaults[loanType];

	loanAmountInput.value = defaults.defaultAmount;
	amountSlider.min = defaults.minAmount;
	amountSlider.max = defaults.maxAmount;
	amountSlider.value = defaults.defaultAmount;

	document.querySelector("#amount-slider + .range-labels span:first-child").textContent = formatShortCurrency(defaults.minAmount);
	document.querySelector("#amount-slider + .range-labels span:last-child").textContent = formatShortCurrency(defaults.maxAmount);

	interestRateInput.value = defaults.defaultRate;
	interestSlider.min = defaults.minRate;
	interestSlider.max = defaults.maxRate;
	interestSlider.value = defaults.defaultRate;

	document.querySelector("#interest-slider + .range-labels span:first-child").textContent = defaults.minRate + "%";
	document.querySelector("#interest-slider + .range-labels span:last-child").textContent = defaults.maxRate + "%";

	loanTermInput.value = defaults.defaultTerm;
	termSlider.min = defaults.minTerm;
	termSlider.max = defaults.maxTerm;
	termSlider.value = defaults.defaultTerm;

	document.querySelector("#term-slider + .range-labels span:first-child").textContent = defaults.minTerm + " yr";
	document.querySelector("#term-slider + .range-labels span:last-child").textContent = defaults.maxTerm + " yrs";
}

function updateTips(loanType) {
	var tips = loanDefaults[loanType].tips;
	var tipsHTML = "";

	tips.forEach((tip) => {
		tipsHTML += `<li>${tip}</li>`;
	});

	tipsContainer.innerHTML = tipsHTML;
	document.querySelector(".helpful-tips h3").textContent = `Helpful Tips for ${loanType.charAt(0).toUpperCase() + loanType.slice(1)} Loans`;
}

amountSlider.addEventListener("input", function () {
	loanAmountInput.value = this.value;
});

interestSlider.addEventListener("input", function () {
	interestRateInput.value = this.value;
});

termSlider.addEventListener("input", function () {
	loanTermInput.value = this.value;
});

loanAmountInput.addEventListener("input", function () {
	amountSlider.value = this.value;
});

interestRateInput.addEventListener("input", function () {
	interestSlider.value = this.value;
});

loanTermInput.addEventListener("input", function () {
	termSlider.value = this.value;
});

calculateBtn.addEventListener("click", calculateEMI);

var chartTabs = document.querySelectorAll(".chart-tab");
chartTabs.forEach((tab) => {
	tab.addEventListener("click", function () {
		chartTabs.forEach((t) => t.classList.remove("active"));
		this.classList.add("active");
		updateChart(this.dataset.chart);
	});
});

function calculateEMI() {
	var principal = parseFloat(loanAmountInput.value);
	var interestRate = parseFloat(interestRateInput.value);
	var tenureYears = parseFloat(loanTermInput.value);
	var paymentType = paymentTypeSelect.value;

	var monthlyRate = interestRate / 12 / 100;

	var numberOfPayments;
	var paymentFactor;

	switch (paymentType) {
		case "monthly":
			numberOfPayments = tenureYears * 12;
			paymentFactor = 1;
			break;
		case "quarterly":
			numberOfPayments = tenureYears * 4;
			paymentFactor = 3;
			break;
		case "yearly":
			numberOfPayments = tenureYears;
			paymentFactor = 12;
			break;
		default:
			numberOfPayments = tenureYears * 12;
			paymentFactor = 1;
	}

	var adjustedRate = Math.pow(1 + monthlyRate, paymentFactor) - 1;

	var emi = (principal * adjustedRate * Math.pow(1 + adjustedRate, numberOfPayments)) / (Math.pow(1 + adjustedRate, numberOfPayments) - 1);

	var totalAmount = emi * numberOfPayments;
	var totalInterest = totalAmount - principal;
	var interestPercentage = (totalInterest / principal) * 100;
	var resultValues = document.querySelectorAll(".results-section .result-value");
	var resultSubvalues = document.querySelectorAll(".results-section .result-subvalue");

	if (resultValues[0])
        resultValues[0].textContent = formatCurrency(emi);
	if (resultValues[1])
        resultValues[1].textContent = formatCurrency(totalAmount);
	if (resultSubvalues[0])
		resultSubvalues[0].textContent = `Principal: ${formatCurrency(principal)} | Interest: ${formatCurrency(totalInterest)}`;
	if (resultValues[2])
        resultValues[2].textContent = "80%";
	if (resultValues[3])
		resultValues[3].textContent = interestPercentage.toFixed(2) + "%";
	if (resultSubvalues[1])
		resultSubvalues[1].textContent = `Total interest is ${interestPercentage.toFixed(2)}% of your principal amount`;

	var principalPercentage = (principal / totalAmount) * 100;
	var interestPercentage2 = (totalInterest / totalAmount) * 100;

	var progressLabels = document.querySelectorAll(".progress-label span:last-child");
	var fillPrincipal = document.querySelector(".progress-fill.fill-principal");
	var fillInterest = document.querySelector(".progress-fill.fill-interest");

	if (progressLabels[0])
		progressLabels[0].textContent = `${formatCurrency(principal)} (${principalPercentage.toFixed(1)}%)`;
	if (fillPrincipal)
        fillPrincipal.style.width = `${principalPercentage}%`;

	if (progressLabels[1])
		progressLabels[1].textContent = `${formatCurrency(totalInterest)} (${interestPercentage2.toFixed(1)}%)`;
	if (fillInterest)
        fillInterest.style.width = `${interestPercentage2}%`;

	var schedule = generateAmortizationSchedule(principal, interestRate, tenureYears, paymentType);
	updateAmortizationTable(schedule, paymentType);
	updateSummaryBox(schedule, totalInterest, emi, paymentType);
	createAmortizationChart(schedule, paymentType);
	createComparisonChart(principal, interestRate, tenureYears);
    createBreakdownChart(principal, totalInterest, principalPercentage.toFixed(1), interestPercentage2.toFixed(1));

	var amortizationTab = document.querySelector('.chart-tab[data-chart="amortization"]');
	if (amortizationTab) amortizationTab.click();
}

function generateAmortizationSchedule(principal, interestRate, tenureYears, paymentType) {
	var ratePerPeriod;
	var periodsPerYear;

	switch (paymentType) {
		case "monthly":
			periodsPerYear = 12;
			break;
		case "quarterly":
			periodsPerYear = 4;
			break;
		case "yearly":
			periodsPerYear = 1;
			break;
		default:
			periodsPerYear = 12;
	}

	ratePerPeriod = interestRate / 100 / periodsPerYear;

	var numberOfPayments = tenureYears * periodsPerYear;
	var emi = (principal * ratePerPeriod * Math.pow(1 + ratePerPeriod, numberOfPayments)) / (Math.pow(1 + ratePerPeriod, numberOfPayments) - 1);
	var schedule = [];
	var balance = principal;
	var totalInterest = 0;
	var totalPrincipal = 0;

	var startDate = new Date();
	var currentDate = new Date(startDate);

	for (var i = 1; i <= numberOfPayments; i++) {
		var interest = balance * ratePerPeriod;
		var principalPaid = parseFloat((emi - interest).toFixed(2));

		balance -= principalPaid;
		if (balance < 0) balance = 0;

		totalInterest += interest;
		totalPrincipal += principalPaid;

		if (paymentType === "monthly") {
			currentDate.setMonth(currentDate.getMonth() + 1);
            document.getElementById("frequency").innerText = "Monthly";
		} else if (paymentType === "quarterly") {
			currentDate.setMonth(currentDate.getMonth() + 3);
            document.getElementById("frequency").innerText = "Quarterly";
		} else {
			currentDate.setFullYear(currentDate.getFullYear() + 1);
            document.getElementById("frequency").innerText = "Yearly";
		}

		schedule.push({
			paymentNumber: i,
			date: new Date(currentDate),
			emi: emi,
			principal: principalPaid,
			interest: interest,
			balance: balance,
			totalInterest: totalInterest,
			totalPrincipal: totalPrincipal
		});
	}

	return schedule;
}

var  rowsPerPage = 20;
var currentPage = 1;
var amortizationSchedule = [];

function updateAmortizationTable(schedule, paymentType) {
    amortizationSchedule = schedule;
    currentPage = 1;
    renderTablePage();
}

function renderTablePage() {
    var  tableBody = document.querySelector("#amortizationTable tbody");
    var tableHTML = "";

    var  startIndex = (currentPage - 1) * rowsPerPage;
    var  endIndex = Math.min(startIndex + rowsPerPage, amortizationSchedule.length);
    var  pageData = amortizationSchedule.slice(startIndex, endIndex);

    for (var i = 0; i < pageData.length; i++) {
        var  payment = pageData[i];
        var  dateFormat = { month: "short", year: "numeric" };
        var  formattedDate = payment.date.toLocaleDateString("en-US", dateFormat);

        tableHTML += `
            <tr>
                <td>${payment.paymentNumber}</td>
                <td>${formattedDate}</td>
                <td>${formatCurrency(payment.emi)}</td>
                <td>${formatCurrency(payment.principal)}</td>
                <td>${formatCurrency(payment.interest)}</td>
                <td>${formatCurrency(payment.balance)}</td>
            </tr>
        `;
    }

    tableBody.innerHTML = tableHTML;
    renderPaginationControls();
}

function renderPaginationControls() {
    var  paginationControls = document.getElementById("paginationControls");
    paginationControls.innerHTML = "";

    var  totalPages = Math.ceil(amortizationSchedule.length / rowsPerPage);

    if (totalPages <= 1) return;
 
    var  prevBtn = document.createElement("button");
    prevBtn.textContent = "Previous";
    prevBtn.setAttribute("class", "btn-pagination");
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => changePage(currentPage - 1));
    paginationControls.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        var  pageBtn = document.createElement("button");
        pageBtn.setAttribute("class", "btn-pagination");
        pageBtn.textContent = i;
        if (i === currentPage) {
            pageBtn.style.fontWeight = "bold";
            pageBtn.style.backgroundColor = "#2563eb";
            pageBtn.style.color = "#fff";
        }
        pageBtn.addEventListener("click", () => changePage(i));
        paginationControls.appendChild(pageBtn);
    }

    var  nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.setAttribute("class", "btn-pagination");
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => changePage(currentPage + 1));
    paginationControls.appendChild(nextBtn);
}

function changePage(pageNumber) {
    var  totalPages = Math.ceil(amortizationSchedule.length / rowsPerPage);
    if (pageNumber < 1 || pageNumber > totalPages) return;
    currentPage = pageNumber;
    renderTablePage();
}

function updateSummaryBox(schedule, totalInterest, emi, paymentType) {
	var firstYearInterest = 0;
	var paymentsInYear =
		paymentType === "monthly" ? 12 : paymentType === "quarterly" ? 4 : 1;

	for (var i = 0; i < paymentsInYear && i < schedule.length; i++) {
		firstYearInterest += schedule[i].interest;
	}

	var halfInterest = totalInterest / 2;
	var cumulativeInterest = 0;
	var paymentsToHalfInterest = 0;

	for (var i = 0; i < schedule.length; i++) {
		cumulativeInterest += schedule[i].interest;
		if (cumulativeInterest >= halfInterest) {
			paymentsToHalfInterest = i + 1;
			break;
		}
	}

	var yearsToHalfInterest = paymentsToHalfInterest / (paymentType === "monthly" ? 12 : paymentType === "quarterly" ? 4 : 1);

	var estimatedSavings = totalInterest * 0.23;

	document.querySelector(".summary-item:nth-child(1) .summary-value").textContent = formatCurrency(firstYearInterest);
	document.querySelector(".summary-item:nth-child(2) .summary-value").textContent = yearsToHalfInterest.toFixed(1) + " years";
	document.querySelector(".summary-item:nth-child(3) .summary-value").textContent = formatCurrency(estimatedSavings);
}

function createAmortizationChart(schedule, paymentType) {
	var chartData = [];

	var samplingRate = 1;
	if (schedule.length > 60) {
		samplingRate = Math.ceil(schedule.length / 60);
	}

	for (var i = 0; i < schedule.length; i += samplingRate) {
		var payment = schedule[i];
		var paymentLabel = paymentType === "monthly" ? `Month ${payment.paymentNumber}` : paymentType === "quarterly" ? `Quarter ${payment.paymentNumber}` : `Year ${payment.paymentNumber}`;

		chartData.push({
			x: payment.paymentNumber,
			y: payment.principal,
			label: paymentLabel,
			interestAmount: payment.interest,
			principalAmount: payment.principal,
			balance: payment.balance,
			cumulativeInterest: payment.totalInterest,
			cumulativePrincipal: payment.totalPrincipal
		});
	}

	if (!amortizationChart) {
		amortizationChart = new CanvasJS.Chart("chartContainer", {
			animationEnabled: true,
			theme: "light2",
			title: {
				text: "Amortization Chart",
				fontSize: 16
			},
			axisX: {
				title: "Payment Number",
				titleFontSize: 14
			},
			axisY: {
				title: "Amount (₹)",
				titleFontSize: 14,
				prefix: "₹",
				includeZero: true
			},
			toolTip: {
				shared: true
			},
			legend: {
				cursor: "pointer",
				verticalAlign: "top",
				horizontalAlign: "center",
				fontSize: 12
			},
			data: [{
                type: "line",
                name: "Principal",
                showInLegend: true,
                color: "#2563eb",
                dataPoints: chartData.map((point) => ({
                    x: point.x,
                    y: point.principalAmount,
                    toolTipContent: `<strong>${point.label}</strong><br/>Principal: ₹{y}<br/>Interest: ${formatCurrency(point.interestAmount.toFixed(2))}<br/>EMI: ${formatCurrency((point.principalAmount + point.interestAmount).toFixed(2))}<br/>Balance: ${formatCurrency(point.balance.toFixed(2))}`
                }))
            }, {
                type: "line",
                name: "Interest",
                showInLegend: true,
                color: "#f59e0b",
                dataPoints: chartData.map((point) => ({
                    x: point.x,
                    y: point.interestAmount,
                    toolTipContent: null
                }))
            }]
		});
	} else {
		amortizationChart.options.title.text = "Amortization Chart";
		amortizationChart.options.data[0].dataPoints = chartData.map((point) => ({
			x: point.x,
			y: point.principalAmount,
			toolTiptoolTipContent: `<strong>${point.label}</strong><br/>Principal: ₹{y}<br/>Interest: ${formatCurrency(point.interestAmount.toFixed(2))}<br/>EMI: ${formatCurrency((point.principalAmount + point.interestAmount).toFixed(2))}<br/>Balance: ${formatCurrency(point.balance.toFixed(2))}`
		}));

		amortizationChart.options.data[1].dataPoints = chartData.map((point) => ({
			x: point.x,
			y: point.interestAmount,
			toolTipContent: null
		}));
	}

	amortizationChart.render();
}

function createComparisonChart(principal, interestRate, tenureYears) {
	var monthlyRate = interestRate / 12 / 100;
	var numberOfPayments = tenureYears * 12;

	var standardEMI = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

	var standardTotalPayment = standardEMI * numberOfPayments;
	var standardTotalInterest = standardTotalPayment - principal;

	// Calculate with 10% higher EMI
	var higherEMI = standardEMI * 1.1;
	var remainingPrincipal = principal;
	var totalPaymentHigher = 0;
	var paymentCount = 0;

	while (remainingPrincipal > 0 && paymentCount < numberOfPayments) {
		var interestPayment = remainingPrincipal * monthlyRate;
		var principalPayment = higherEMI - interestPayment;

		remainingPrincipal -= principalPayment;
		totalPaymentHigher += higherEMI;
		paymentCount++;

		if (remainingPrincipal <= 0) {
			break;
		}
	}

	var higherTotalInterest = totalPaymentHigher - principal;
	var higherTenure = paymentCount / 12;

	// Calculate with 20% down payment
	var downPaymentAmount = principal * 0.2;
	var loanWithDownPayment = principal - downPaymentAmount;

	var downPaymentEMI = (loanWithDownPayment * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

	var downPaymentTotalPayment =
		downPaymentEMI * numberOfPayments + downPaymentAmount;
	var downPaymentTotalInterest = downPaymentTotalPayment - principal;

	if (!comparisonChart) {
		comparisonChart = new CanvasJS.Chart("comparisonChart", {
			animationEnabled: true,
			theme: "light2",
			title: {
				text: "Payment Strategy Comparison",
				fontSize: 16
			},
			axisY: {
				title: "Amount (₹)",
				titleFontSize: 14,
				prefix: "₹",
				includeZero: false
			},
			toolTip: {
				shared: true
			},
			legend: {
				cursor: "pointer",
				verticalAlign: "top",
				horizontalAlign: "center",
				fontSize: 12
			},
			data: [{
				type: "column",
				name: "Total Interest",
				showInLegend: true,
				yValueFormatString: "₹##,##,##0",
				color: "#f59e0b",
				dataPoints: [{
						label: "Standard EMI",
						y: standardTotalInterest,
						toolTipContent: "Standard EMI: " + formatCurrency(standardEMI.toFixed(0)) + "<br/>Tenure: " + tenureYears + " years<br/>Total Interest: {y}"
					},
					{
						label: "10% Higher EMI",
						y: higherTotalInterest,
						toolTipContent: "Higher EMI: ₹" + formatCurrency(higherEMI.toFixed(0)) + "<br/>Tenure: " + higherTenure.toFixed(1) + " years<br/>Total Interest: ₹{y}"
					},
					{
						label: "20% Down Payment",
						y: downPaymentTotalInterest,
						toolTipContent: "Down Payment: ₹" + formatCurrency(downPaymentAmount.toFixed(0)) + "<br/>EMI: ₹" + downPaymentEMI.toFixed(0) + "<br/>Total Interest: ₹{y}"
					}
				]
			}]
		});
	} else {
		comparisonChart.options.data[0].dataPoints = [{
				label: "Standard EMI",
				y: standardTotalInterest,
				toolTipContent: "Standard EMI: ₹" + standardEMI.toFixed(0) + "<br/>Tenure: " + tenureYears + " years<br/>Total Interest: ₹{y}"
			},
			{
				label: "10% Higher EMI",
				y: higherTotalInterest,
				toolTipContent: "Higher EMI: ₹" + higherEMI.toFixed(0) + "<br/>Tenure: " + higherTenure.toFixed(1) + " years<br/>Total Interest: ₹{y}"
			},
			{
				label: "20% Down Payment",
				y: downPaymentTotalInterest,
				toolTipContent: "Down Payment: ₹" + downPaymentAmount.toFixed(0) + "<br/>EMI: ₹" + downPaymentEMI.toFixed(0) + "<br/>Total Interest: ₹{y}"
			}
		];
	}

	comparisonChart.render();
}

function createBreakdownChart(principal, totalInterest, principalPercentage, interestPercentage) {
	if (!breakdownChart) {
		breakdownChart = new CanvasJS.Chart("breakdownChart", {
			animationEnabled: true,
			theme: "light2",
			data: [{
				type: "pie",
                startAngle: 180,
				yValueFormatString: "₹#,##,##0.00",
				dataPoints: [{
                    label: "Principal",
                    y: principal,
                    yPercent: principalPercentage,
                    color: "#2563eb",
                },{
                    label: "Interest",
                    y: totalInterest,
                    yPercent: interestPercentage,
                    color: "#f59e0b",
                    exploded: true
                }]
			}]
		});
	} else {
		breakdownChart.options.data[0].dataPoints = [{
            label: "Principal",
            y: principal,
            color: "#2563eb"
        },{
            label: "Interest",
            y: totalInterest,
            color: "#f59e0b"
        }];
	}

	breakdownChart.render();
}

function updateChart(chartType) {
	var principal = parseFloat(loanAmountInput.value);
	var interestRate = parseFloat(interestRateInput.value);
	var tenureYears = parseFloat(loanTermInput.value);
	var paymentType = paymentTypeSelect.value;

	var schedule = generateAmortizationSchedule(principal, interestRate, tenureYears, paymentType);

	var chartData = [];

	var samplingRate = 1;
	if (schedule.length > 60) {
		samplingRate = Math.ceil(schedule.length / 60);
	}

	for (var i = 0; i < schedule.length; i += samplingRate) {
		var payment = schedule[i];
		var paymentLabel = paymentType === "monthly" ? `Month ${payment.paymentNumber}` : paymentType === "quarterly" ? `Quarter ${payment.paymentNumber}` : `Year ${payment.paymentNumber}`;

		chartData.push({
			x: payment.paymentNumber,
			y: payment.principal,
			label: paymentLabel,
			interestAmount: payment.interest,
			principalAmount: payment.principal,
			balance: payment.balance,
			cumulativeInterest: payment.totalInterest,
			cumulativePrincipal: payment.totalPrincipal
		});
	}

	switch (chartType) {
		case "amortization":
			amortizationChart.options.title.text = "Amortization Chart";
			amortizationChart.options.data = [{
                type: "line",
                name: "Principal",
                showInLegend: true,
                color: "#2563eb",
                dataPoints: chartData.map((point) => ({
                    x: point.x,
                    y: point.principalAmount,
                    toolTipContent: `<strong>${point.label}</strong><br/>Principal: ₹{y}<br/>Interest: ${formatCurrency(point.interestAmount.toFixed(2))}<br/>EMI: ${formatCurrency((point.principalAmount + point.interestAmount).toFixed(2))}<br/>Balance: ${formatCurrency(point.balance.toFixed(2))}`
                }))
            }, {
                type: "line",
                name: "Interest",
                showInLegend: true,
                color: "#f59e0b",
                dataPoints: chartData.map((point) => ({
                    x: point.x,
                    y: point.interestAmount,
                    toolTipContent: null
                }))
            }];
			break;

		case "principal-interest":
			amortizationChart.options.title.text = "Principal vs Interest Over Time";
			amortizationChart.options.data = [{
                type: "line",
                name: "Cumulative Principal",
                showInLegend: true,
                color: "#2563eb",
                dataPoints: chartData.map((point) => ({
                    x: point.x,
                    y: point.cumulativePrincipal,
                    toolTipContent: `<strong>${point.label}</strong><br/>Cumulative Principal: ${formatCurrency(point.cumulativePrincipal)}<br/>Cumulative Interest: ${formatCurrency(point.cumulativeInterest.toFixed(2))}`
                }))
            }, {
                type: "line",
                name: "Cumulative Interest",
                showInLegend: true,
                color: "#f59e0b",
                dataPoints: chartData.map((point) => ({
                    x: point.x,
                    y: point.cumulativeInterest,
                    toolTipContent: null
                }))
            }];
			break;

		case "balance":
			amortizationChart.options.title.text = "Outstanding Balance";
			amortizationChart.options.data = [{
				type: "area",
				name: "Balance",
				showInLegend: true,
				color: "#3b82f6",
				dataPoints: chartData.map((point) => ({
					x: point.x,
					y: point.balance,
					toolTipContent: `<strong>${point.label}</strong><br/>Outstanding Balance: ${formatCurrency(point.balance)}<br/>Principal Paid: ${formatCurrency(point.cumulativePrincipal.toFixed(2))}<br/>Interest Paid: ₹${formatCurrency(point.cumulativeInterest.toFixed(2))}`
				}))
			}];
			break;
	}

	amortizationChart.render();
}

function formatCurrency(amount) {
    return CanvasJS.formatNumber(parseFloat(amount), "₹##,##,###.00");
}

function formatShortCurrency(amount) {
	if (amount >= 10000000) {
		return (amount / 10000000).toFixed(1) + "Cr";
	} else if (amount >= 100000) {
		return (amount / 100000).toFixed(1) + "L";
	} else if (amount >= 1000) {
		return (amount / 1000).toFixed(1) + "K";
	} else {
		return amount.toString();
	}
}

function initCalculator() {
	updateInputDefaults("home");
	updateTips("home");
	calculateEMI();
}

initCalculator();