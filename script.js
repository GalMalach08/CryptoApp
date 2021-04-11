//updated !!
let interval;
let coin1Value = []
let coin2Value = []
let coin3Value = []
let coin4Value = []
let coin5Value = []
let coinsNameArr = []

// calling the about page with fetch request
async function fetchAboutPage() {
    try {
        showSpinner()
        clearInterval(interval) // clear the interval of the live page if working
        $('.main-page-header').hide()
        $('.search-div').hide()
        const res = await fetch('aboutme.html');
        const data = await res.text()
        makeActive($('#about'))
        $('#coin-container').html(data)
        hideSpinner()
    } catch (err) {
        console.log(err);
    }
}

// Calling the Live page with fetch request
async function fetchLiveRosterPage() {
    try {
        showSpinner()
        makeActive($('#live')) // making the 'live' nav link active and the other one's not active
        $('#headline').html('Live Reports')
        $('.main-page-header').show()
        $('.search-div').hide()
        const res = await fetch('reports.html');
        const data = await res.text()

        $('#coin-container').html(data)

        coin1Value = [] //reset the array's 
        coin2Value = []
        coin3Value = []
        coin4Value = []
        coin5Value = []
        coinsNameArr = []
        interval = setInterval(getSymbol, 2000) // activate the function that build the graph
    } catch (err) {
        console.log(err);
    }
}

// makes the first fetch request to the coins list api
async function showCoins() {
    try {
        $('#headline').html('Most popular digital coins rates')
        let mainCoinArr = []; //array that will contain all the coins that added to the page by their symbol and id
        showSpinner()
        $('.search-div').show()
        $('.main-page-header').show()
        makeActive($('#home')) //array that will contain all the coins that added to the page by their symbol and id
        $('#coin-container').empty() // reset the main container and clear the interval of the live page if working
        clearInterval(interval)

        const response = await fetch('https://api.coingecko.com/api/v3/coins/list'); //makes the request to the coins api
        const coinArr = await response.json(); // returns array of objects
        for (let i = 0; i < 30; i++) {
            mainCoinArr.push(coinArr[i])
        }
        await addCoin(mainCoinArr)
        localStorage.setItem('mainCoinArr', JSON.stringify(mainCoinArr));

        await addCoinsToModaOnLoad() //trigger the function that build the modal log on load

    } catch (err) {
        console.log(err);
    }
}
showCoins()


//adding the coin to the page
function addCoin(coinArr) {
    const coinContainer = document.getElementById('coin-container'); // the main container
    coinArr.forEach(coinData => {
        const coinCard = document.createElement('div');
        coinCard.className = 'col-12 col-md-6 col-lg-4';
        coinCard.id = `card-${coinData.symbol.toUpperCase()}`;
        let indexOfDash = coinData.symbol.indexOf('-') // making long name's coin shorter
        indexOfDash === -1 ? indexOfDash = coinData.symbol.length : indexOfDash === indexOfDash;

        coinCard.innerHTML +=
            `
                <div class='card coin-card'>
                    <div class='card-body'>
                    <div class='card-header'>
                    <h5 class='card-title'>${coinData.symbol.substring(0,indexOfDash).toUpperCase()}</h5>
                    <input type='checkbox' id='${coinData.id}' onchange='setReportList(event)'>
                    <label for='${coinData.id}' id='label-${coinData.id}' title='Click to Add or Remove coin to Favorite list'>Toggle</label>
                    </div>
                    <div class='card-text'>
                    <p>${coinData.name.toUpperCase()}</p>
                    <input class='star' type='checkbox' id='checkbox-star-${coinData.id}' title='bookmark page' disabled='disabled'>
                    </div>
                    <div id='more-info-btn'>
                     <button class='btn btn-outline-secondary more-info-btn' type='button'  data-toggle='collapse' data-target='#collapse-${coinData.id}' id='more-info-btn-${coinData.id}'> More Info </button>
                    </div>
                    <div class='collapse' id='collapse-${coinData.id}'>
                        <div class='card card-body' id='more-info-card-${coinData.id}'> 
                        </div>
                    </div>
                </div>
        `
        coinContainer.appendChild(coinCard); // append the new coin to the main container
        let button = document.getElementById(`more-info-btn-${coinData.id}`)

        addMoreInfoEvent(button, coinData.id)
    })
}


// adding the more info event to the button 
function addMoreInfoEvent(btn, id) {

    btn.addEventListener('click', async function() {
        const moreInfoCard = document.getElementById(`more-info-card-${id}`) // getting the div in the collapse
        moreInfoCard.className = 'more-info-card'
        const thisCoin = JSON.parse(localStorage.getItem(id));

        if (thisCoin != null && thisCoin.time + 120000 > Date.now()) { // if its not the first time i made the request and the last time was less than 2 minutes ago
            console.log('getting data from local storage');

            moreInfoCard.innerHTML = `
            <div><img id='more-info-img' src='${thisCoin.img}'/></div>
            <p class='more-info-paragraph'>Value in Dollar: ${thisCoin.dolar} $</p>
            <p class='more-info-paragraph'>Value in Euro: ${thisCoin.euro} €</p>
            <p class='more-info-paragraph'>Value in ILS: ${thisCoin.ils} ₪</p>   
         `
        } else { // if its the first time or the last request was more than 2 minutes ago
            console.log('getting data from fetch'); // bring the information from the api
            showSpinner()

            const coinResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`) // fetch request to the coin api by his id
            const coinData = await coinResponse.json();
            moreInfoCard.innerHTML = `
                        <div><img id='more-info-img' src='${coinData.image.small}'/></div>
                        <p class='more-info-paragraph'>Value in Dollar: ${coinData.market_data.current_price.usd.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} $</p>
                        <p class='more-info-paragraph'>Value in Euro: ${coinData.market_data.current_price.eur.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} €</p>
                        <p class='more-info-paragraph'>Value in ILS: ${coinData.market_data.current_price.ils.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₪</p>   
                `

            hideSpinner()
            let coin = { // adding the coin info to the local storage with the current time for future useage
                img: coinData.image.small,
                dolar: coinData.market_data.current_price.usd.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                euro: coinData.market_data.current_price.eur.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                ils: coinData.market_data.current_price.ils.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                time: Date.now(),
                id: id
            }
            localStorage.setItem(coin.id, JSON.stringify(coin)) // save the new coin to the local storage by its id
        }

    })
}

async function addCoinsToModaOnLoad() {
    try {
        let toggleCoinArr = JSON.parse(localStorage.getItem('toggle-coins')) || [];

        //empty the modal content from previous content
        $('#coin-modal-content').empty();

        toggleCoinArr.forEach(async(coin) => {
            await addSelectedCoinToModal(coin)
        });

        //checks all the chosen coins onload
        let coinsArr = JSON.parse(localStorage.getItem('mainCoinArr')) || [];
        for (let i = 0; i < coinsArr.length; i++) {
            for (let j = 0; j < toggleCoinArr.length; j++) {
                if (coinsArr[i].id === toggleCoinArr[j]) {
                    let checkbox = document.getElementById(toggleCoinArr[j])
                    checkbox.checked = true;
                    $(`#checkbox-star-${toggleCoinArr[j]}`)[0].checked = true;
                }
            }
        }

        hideSpinner()
    } catch (err) {
        console.log(err);
    }
}

// add the toggle coins to the modal and local storage
async function setReportList(event) {
    try {
        let toggleCoinArr = JSON.parse(localStorage.getItem('toggle-coins')) || [];
        const id = event.target.id; // getting the id from the checkbox that triggered the event

        if (toggleCoinArr.length < 5 && event.target.checked) { //if the checkbox is checked and the is less than 5 coins in the array
            toggleCoinArr.push(id)
            localStorage.setItem('toggle-coins', JSON.stringify(toggleCoinArr))
            await addSelectedCoinToModal(id) //building new coin div in the modal and append it
            $(`#checkbox-star-${id}`)[0].checked = true;



            //if the checkbox is unchecked
        } else if (!event.target.checked) {
            toggleCoinArr = toggleCoinArr.filter((coin) => coin != id) //delete the coin from the arr and the modal div, and update the local storage
            localStorage.setItem('toggle-coins', JSON.stringify(toggleCoinArr))
            const coinModalContent = document.getElementById('coin-modal-content');
            const deltetedCoindiv = document.getElementById(`coin-div-${id}`)
            coinModalContent.removeChild(deltetedCoindiv)
            console.log(`remove ${id} from modal`)
            $(`#checkbox-star-${id}`)[0].checked = false;


            //if there is already 5 coins in the array show the modal
        } else if (toggleCoinArr.length > 4) {
            $('#coin-modal').modal('show');
            //dont check the checkbox
            event.target.checked = false;
            //save the coin to the opintal cahnge coin in the local storage
            localStorage.setItem('optionalChangeCoin', event.target.id)
        }
    } catch (err) {
        console.log(err);
    }
}

async function addSelectedCoinToModal(coin) {
    try {
        showSpinner()
        const coinResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}`)
        const coinData = await coinResponse.json();
        const coinDiv = document.createElement('div');
        coinDiv.className = 'coin-div'
        coinDiv.id = `coin-div-${coin}`
        coinDiv.innerHTML =
            `
                <p class='modal-content-paragraph switch-input'><span class='modal-content-span'><img src='${coinData.image.small}'</span> ${coinData.symbol}</p>
                <input type='checkbox' checked class='switch-input' id='checkbox-${coinData.id}' onchange='deleteCoin(event)'>
                <label for='checkbox-${coinData.id}'>Toggle</label>
            `
        $('#coin-modal-content').append(coinDiv)
        console.log(`added ${coin} to modal`)
        hideSpinner()
    } catch (err) {
        console.log(err);
    }

}

// invoke by changing the coin checkbox in the modal
async function deleteCoin(event) {
    try {
        let toggleCoinArr = JSON.parse(localStorage.getItem('toggle-coins')) || [];
        const coinModalContent = document.getElementById('coin-modal-content');
        let id = event.target.id;

        showSpinner()

        //delete from the modal
        id = id.replace('checkbox', 'coin-div');
        const div = document.getElementById(id)
        coinModalContent.removeChild(div)
        console.log(`remove ${id} from modal`)
            //delete from the localstorage
        id = id.replace('coin-div-', '')
        toggleCoinArr = toggleCoinArr.filter((coin) => coin != id)
        localStorage.setItem('toggle-coins', JSON.stringify(toggleCoinArr))

        //makes the checkbox unchecked
        let checkBox = document.getElementById(id);
        checkBox.checked = false;
        $(`#checkbox-star-${id}`)[0].checked = false;

        //hide the modal
        $('#coin-modal').modal('hide');

        //add the new coin to the modal
        const coin = localStorage.getItem('optionalChangeCoin');
        await addSelectedCoinToModal(coin)

        //check the new coin checkbox
        let newCoinCheckBox = document.getElementById(coin);
        newCoinCheckBox.checked = true;
        $(`#checkbox-star-${coin}`)[0].checked = true;

        //add the new coin to the toggle array coins
        toggleCoinArr.push(coin);
        localStorage.setItem('toggle-coins', JSON.stringify(toggleCoinArr))

        hideSpinner()
    } catch (err) {
        console.log(err);
    }
}

async function showFavorite() {
    try {
        showSpinner()
        clearInterval(interval)
        $('#coin-container').empty()
        $('.main-page-header').show()
        makeActive($('#favorite'))
        $('#headline').html('Favorite Coins')
        let bool = false;
        $('.search-div').hide()
        const coinsArr = JSON.parse(localStorage.getItem('mainCoinArr'));
        const toggleCoinArr = JSON.parse(localStorage.getItem('toggle-coins')) || [];
        if (toggleCoinArr.length === 0) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'no-coin-selected-card';

            alertDiv.innerHTML = ` <div class='card alert-card-content' style='width:45rem;'>
                                    <div class='card-body'>
                                        <h3 class="card-title">No Coin was selected</h5>
                                        <h5 class='card-text'>Please return to the home page and mark your favorites coin</h5>
                                        <a href='#' class='card-link' onclick='showCoins()'>Back to Home Page</a>
                                      
                                    </div>
                                </div>`
            $('#coin-container').append(alertDiv)
            hideSpinner()
        } else {
            for (let i = 0; i < coinsArr.length; i++) {
                for (let j = 0; j < toggleCoinArr.length; j++) {
                    if (coinsArr[i].id === toggleCoinArr[j]) {
                        bool = true;
                    }
                }
                if (bool) {
                    addCoin([coinsArr[i]])
                }
                bool = false;
            }
            await addCoinsToModaOnLoad()
            hideSpinner()
        }
    } catch (err) {
        console.log(err);
    }

}

//makes the search proccsess
function search() {
    let bool = true;
    let coinsArr = JSON.parse(localStorage.getItem('mainCoinArr'));
    let searchInputValue = document.getElementById('search-input').value.toLowerCase();
    if (searchInputValue !== '') {
        for (let i = 0; i < coinsArr.length; i++) {
            if (coinsArr[i].symbol.toLowerCase() === searchInputValue) {
                let divId = coinsArr[i].symbol.toUpperCase();
                $('#coin-container').children().hide();
                $(`#card-${divId}`).show()
                $('#search-input').val('')
                $('#search-span').html('')
                bool = false;
            }
        }
        if (bool) {
            $('#search-span').html('No coin was found 😢')
            setTimeout(() => $('#search-span').html(''), 3000);
        }
    } else {
        $('#search-span').html(`Please enter the coin's name`)
        setTimeout(() => $('#search-span').html(''), 3000);
    }
}


// Live Reports functionality

async function getSymbol() {
    try {
        console.log('symbol');
        const toggleCoinArr = JSON.parse(localStorage.getItem('toggle-coins')) || [];
        if (toggleCoinArr.length === 0) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert-card';
            alertDiv.innerHTML = ` <div class='card alert-card-content' style='width:45rem;'>
                                    <div class='card-body'>
                                        <h3 class="card-title">No Coin was selected</h3>
                                        <h5 class='card-text'>Please return to the home page and mark the coins you want to display on our live graph</h5>
                                        <a href='#' class='card-link' onclick='showCoins()'>Back to Home Page</a>
                                      
                                    </div>
                                </div>`
            $('#chartContainer').append(alertDiv)
            clearInterval(interval)
            hideSpinner()
        } else {
            let count = 0
            let apiString = '';
            toggleCoinArr.forEach(async(coin) => {
                const coinResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}`)
                const coinData = await coinResponse.json();
                apiString += `${coinData.symbol},`
                count++
                if (count === toggleCoinArr.length) {
                    getData(apiString);
                }
            })
        }
    } catch (err) {
        console.log(err);
    }
}

async function getData(apiString) {
    try {
        const coinResponse = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${apiString}&tsyms=USD`)
        let coinData = await coinResponse.json();

        if (coinData.Response !== 'Error') { // Dealing with cases where all selected coins dont have information available on their price - prevents the display of a blank graph
            coinData = Object.keys(coinData).sort().reduce((a, c) => (a[c] = coinData[c], a), {}) //sort the object-important

            let coinCounter = 0;
            let newDate = new Date();
            for (let coin in coinData) {
                switch (coinCounter) {
                    case 0:
                        coin1Value.push({
                            x: newDate,
                            y: coinData[coin].USD,
                        })
                        coinsNameArr.push(coin)
                        coinCounter++
                        break;

                    case 1:
                        coin2Value.push({
                            x: newDate,
                            y: coinData[coin].USD,
                        })
                        coinsNameArr.push(coin)
                        coinCounter++
                        break;
                    case 2:
                        coin3Value.push({
                            x: newDate,
                            y: coinData[coin].USD,
                        })
                        coinsNameArr.push(coin)
                        coinCounter++
                        break;
                    case 3:
                        coin4Value.push({
                            x: newDate,
                            y: coinData[coin].USD,
                        })
                        coinsNameArr.push(coin)
                        coinCounter++
                        break;
                    case 4:
                        coin5Value.push({
                            x: newDate,
                            y: coinData[coin].USD,
                        })
                        coinsNameArr.push(coin)
                        coinCounter++
                        break;
                }

            }
            createGraph()
        } else {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert-card';
            alertDiv.innerHTML = ` <div class='card alert-card-content' style='width:45rem;'>
                                    <div class='card-body'>
                                        <h3 class="card-title">All selected coins do not have information available on their price</h3>
                                        <h5 class='card-text'>Please return to the home page and mark the coins you want to display on our live graph</h5>
                                        <a href='#' class='card-link' onclick='showCoins()'>Back to Home Page</a>
                                      
                                    </div>
                                </div>`
            $('#chartContainer').append(alertDiv)
            clearInterval(interval)
            hideSpinner()
        }
    } catch (err) {
        console.log(err);
    }
}

function createGraph(event) {

    let chart = new CanvasJS.Chart("chartContainer", {
        exportEnabled: true,
        animationEnabled: false,
        backgroundColor: "black",

        title: {
            text: "Live Reports",
            fontColor: "lightgrey",
        },
        axisX: {
            valueFormatString: "HH:mm:ss",
            lineColor: "lightgrey",
            tickColor: "lightgrey",
            labelFontColor: "lightgrey",
            titleFontColor: "lightgrey",
        },
        axisY: {
            title: "Coin Value",
            lineColor: "lightgrey",
            tickColor: "lightgrey",
            labelFontColor: "lightgrey",
            titleFontColor: "lightgrey",
            includeZero: true,
            suffix: "$"
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries
        },

        data: [{
            type: "spline",
            name: coinsNameArr[0],
            color: "green",
            showInLegend: true,
            xValueFormatString: "HH:mm:ss",
            dataPoints: coin1Value
        }, {
            type: "spline",
            name: coinsNameArr[1],
            color: "purple",
            showInLegend: true,
            xValueFormatString: "HH:mm:ss",
            dataPoints: coin2Value
        }, {
            type: "spline",
            name: coinsNameArr[2],
            color: "red",
            showInLegend: true,
            xValueFormatString: "HH:mm:ss",
            dataPoints: coin3Value
        }, {
            type: "spline",
            name: coinsNameArr[3],
            color: "blue",
            showInLegend: true,
            xValueFormatString: "HH:mm:ss",
            dataPoints: coin4Value
        }, {
            type: "spline",
            name: coinsNameArr[4],
            showInLegend: true,
            color: "yellow",
            xValueFormatString: "HH:mm:ss",
            dataPoints: coin5Value
        }]
    });

    chart.render();
    hideSpinner();

    function toggleDataSeries(e) {
        if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            console.log(e.dataSeries);
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }
}


// Auxiliary functions

function showSpinner() {
    $('#spinner').removeAttr('hidden');
    $('#overlay').removeAttr('hidden');
}

function hideSpinner() {
    $('#spinner').attr('hidden', '');
    $('#overlay').attr('hidden', '');
}

function makeActive(link) {
    for (let i = 0; i < $('.nav-link').length; i++) {
        link[0].id === $('.nav-link')[i].id ? $('.nav-link')[i].classList.add('active') : $('.nav-link')[i].classList.remove('active');
    }
}