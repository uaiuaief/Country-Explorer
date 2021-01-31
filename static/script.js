class Search{
    country_name;
    query;
    page;
}

$('#getAPI').on('click', onchange);  
$('#search-bar').on('keyup', onchange);


// let api_url = 'https://restcountries.eu/rest/v2';
// let api_url = 'http://localhost:5000/api/countries';
let api_url = '/api/countries';
let dataPromise = getData()
renderMainPage(dataPromise)

function formatNumber(num){
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
}

async function getData(){
    let res = await fetch(api_url)
    let data = await res.json()
    countries = data.map(country => country)
    
    return countries;
}

async function renderMainPage(promise){
    data = await promise;
    let output='';
    await data.forEach(country => {
        output += renderCountryHTML(country);
    })

    output = wrapDiv(output, 'country-flags')

    $('#output').html(output);
    $('.loader-wrapper').fadeOut(800, () => {
        $('section').fadeIn()
        $('header').fadeIn()
        $('#search-bar-container').fadeIn()
    });
}

function wrapDiv(html, classname){
    let wraped_html = `<div class="${classname}">`;
    wraped_html += html;
    wraped_html += '</div>';
    return wraped_html
}

async function onchange(){
    info = $('.info-wrapper');
    info.hide()
    let countries = await dataPromise;
    let field_value = $('#search-bar').val();
    const filtered = countries.filter(value => {
        if (value.translations.br.toLowerCase().includes(field_value.toLowerCase())){
            return value;
        }
    })

    let output = '';
    filtered.forEach(country => {            
        output += renderCountryHTML(country);
    })
    output = wrapDiv(output, 'country-flags')

    $('#output').html(output);
}

function defaultImg(img){
    img.onerror = '';
    img.src = 'notfound.png'
}

function renderSearchResultHTML(src){
    let html = `
                <div class="img-result">
                    <img onerror="defaultImg(this)" loading="lazy" src="${src}" alt="">
                </div>
               `
    return html
}

function renderCountryHTML(country){
    let name_translation = country.translations.br;
    if(country.name == 'Austria'){
        name_translation = 'Áustria'
    }
    let html = `
                <div class="country">
                    <div class="flag-wrapper">
                        <img id="${country.name}" loading="lazy" class="flag" src=${country.flag}>
                    </div>
                    <a class="countryName" href="#">${name_translation}</a>
                    <br>
                </div>
               `
    return html;
}

function renderInfoHTML(country){
    let languages = ''
    country.languages.forEach(lan => {
        languages+= lan.name+' ('+lan.nativeName+'), '
    })
    let currencies = ''
    country.currencies.forEach(cur => {
        currencies += `${cur.name} (${cur.code}) (${cur.symbol})/ `
    })
    languages = languages.slice(0, -2);
    currencies = currencies.slice(0, -2);
    let html = `
                <div class="country-info">
                     <!-- <div class="img-info-wrapper"> -->
                        <img class="flag-img" src="${country.flag}" alt="${country.name}">
                     <!-- </div> -->
                    <button class="close-button"> x </button>
                    <div class="text-wrapper">
                        <h1>${country.translations.br}</h1>
                        <p>Capital: ${country.capital}</p>
                        <p>População: ${formatNumber(country.population)}</p>
                        <p>Região: ${country.region}</p>
                        <p>Idiomas: ${languages}</p>
                        <p>Moeda: ${currencies}</p>
                    </div>
                </div>
                <div class="search-suggestions">
                    <button class="suggestion" href="">Cultura</button>
                    <button class="suggestion" href="">Pessoas</button>
                    <button class="suggestion" href="">Lugares</button>
                </div>
                `

    return html;
}

function showInfo(country){
    info = $('.info-wrapper');
    info.html(renderInfoHTML(country));
    info.show();
    $("body,html").animate({scrollTop: $("header").offset().top+168}, 300)
    $('.close-button').on('click', () => {
        info.hide()
        onchange(); 
    })
} 


$(window).on('click', async e => {
    let target = e.target;
    try {
        countries = await dataPromise;
        let countryName = target.parentElement.nextElementSibling.innerHTML;
        const filtered = countries.filter(value => {
                if (value.translations.br.toLowerCase() == countryName.toLowerCase()){
                    return value;
                }
            })
        country = filtered[0]
        showInfo(country)
    } catch (error) {
        // console.error(error);
    }
    onClickSearch(target);

})

function onClickSearch(target){
    if(target.className == 'suggestion'){
        let query = $(target).text();
        if (query == 'Pessoas'){
            query = 'people'

        }else if (query == 'Cultura'){
            query = 'culture'
        
        }else {
            query = 'places'
        }
 
        countryName = target.parentElement.previousElementSibling.firstElementChild.alt;
        query = countryName + '+' + query ;
        query = query.replace(/ /g, "+")
        
        Search.country_name = countryName;
        Search.query = query;
        Search.page = 2;

        img_promise = searchImages(query);
        loadImageResults(img_promise)
        $('.suggestion').css('background-color', '#111')
        $(target).css('background-color', '#b51500')
        $("body,html").animate({scrollTop: $(".search-suggestions").offset().top - 90}, 300)
    }
}

async function searchImages(query, start=1){
    // let key = APIKEY;
    // let cx = CX;
    // let google_api_url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${query}&start=${start}&searchType=image`;
    query=query.replace(' ', '+');
    // let google_api_url = `http://localhost:5000/api/images?query=${query}&start=${start}`;
    let google_api_url = `/api/images?query=${query}&start=${start}`;
    let images = [];

    await fetch(google_api_url)
    .then(res => res.json())
    .then((data) => {
        data.items.forEach(item => {
            images.push(item.link);
        })
    })
    return images;
}

async function loadImageResults(images_promise){
    output = ''
    images = await images_promise
    images.forEach(img_src => {
        output += renderSearchResultHTML(img_src)
    });
    output = wrapDiv(output, 'search-results');
    let loadbutton = `<button id="load-button">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M7.75745 10.5858L9.17166 9.17154L12.0001 12L14.8285 9.17157L16.2427 10.5858L12.0001 14.8284L7.75745 10.5858Z"
                                fill="currentColor"
                            />
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z"
                                fill="currentColor"
                            />
                    </svg>
                </button>
    `
    $('#output').html(output);
    $('#output').append(loadbutton);
    $('#load-button').on('click', loadMore);
    zoomImg();
}

function zoomImg(){
    let zc = $('.zoom-container');

    $('.img-result').on('click', (e) => {
        img = e.target;
        zc.fadeIn()
        $('.img-zoom').html(img.outerHTML);
    })

    zc.on('click', () => {
        zc.fadeOut();
        
    })
}

async function loadMore(){
    let start = (Search.page * 10) - 9
    let results = await searchImages(Search.query, start)
    results.forEach(img_src => {
        $('.search-results').append(renderSearchResultHTML(img_src))
    })
    Search.page += 1;
    
    zoomImg();
}

$(window).on('scroll', () => {
    let search_bar = $('.search-bar-container');
    let height = $('header').height(); 

    if(window.pageYOffset > height){
        search_bar.addClass('sticky')
        $('header').css("margin-bottom", "80px");
    }else{
        search_bar.removeClass('sticky')
        $('header').css("margin-bottom", "0");
    }

})

