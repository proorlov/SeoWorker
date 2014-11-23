var SeoParser = require("./seo_parser");

function SeoParameters() {
    console.log('SeoParameters init');
};

var regexpSplit = /[\s,\-\.;:/\(\)!\?\[\]{}_\\\|~<>*\+=]+/;
/*
 среднее совпадение двух фраз
 */
SeoParameters.prototype.complianceStringsVal = function (text1, text2) {
    var matchWords = 0;
    // - плохо cчитывается!!!
    var words1 = text1.toLowerCase().split(regexpSplit).filter(function (e) {
        return e
    });
    var words2 = text2.toLowerCase().split(regexpSplit).filter(function (e) {
        return e
    });
    for (var key in words1) {
        if (words2.indexOf(words1[key]) > -1) {
            matchWords++;
        }
    }
    var maxLength = words1.length;
    if (words2.length > maxLength) {
        maxLength = words2.length;
    }
    /*
    console.log('параметр по среднему, 1 фраза', text1, '2 фраза ', text2);
    console.log(words1.toString());
    console.log(words2.toString());
    console.log("макс длина", maxLength, "совпадающие слова", matchWords)
    */
    if (maxLength > 0) {
        return (matchWords * 100 / maxLength);
    } else {
        throw new Error("Нулевая длина фразы.");
    }
}
//получаем строку с процентом вхождения фразы text2 в text1
SeoParameters.prototype.complianceStrings = function (text1, text2) {
    var res = this.complianceStringsVal(text1,text2);
    return res.toFixed(2) + '%';
}
SeoParameters.prototype.init = function (keyText, url, rawHtml, callback, errback) {
    this.keyText = keyText;
    this.url = url;
    this.parser = new SeoParser();
    this.parser.initDom(rawHtml, callback, errback);
}

SeoParameters.prototype.tryCatch = function (func, params) {
    try {
      var val =  func.apply(this, params);
      return {success: true, val: val};
    } catch (err) {
      return {success: false, err: err.message};
    }
};

SeoParameters.prototype.parse = function () {
    var sList = this.tryCatch(this.getSearchPicksArray, []);
    sList.name = "sList";
    sList.ru_name = "Выдача";
    sList.description = "Поисковая выдача на страничке (google,yandex)";
    return sList;
}

SeoParameters.prototype.getAllParams = function () {
  var titleCS = this.tryCatch(this.tagCSFirst, ["title"]);
  titleCS.name = "titleCS";
  titleCS.ru_name = "ССЗ(title)"; 
  titleCS.description = "Среднее совпадение ключевой фразы с тегом title.";

  var h1CS = this.tryCatch(this.tagCSFirst, ["h1"]);
  h1CS.name = "h1CS";
  h1CS.ru_name = "СССЗ(h1)"; 
  h1CS.description = "Среднее совпадение ключевой фразы с тегом h1.";
  
  var h2CS = this.tryCatch(this.prettyTagCS, ["h2"]);
  h2CS.name = "h2CS";
  h2CS.ru_name = "СССЗ(h2)"; 
  h2CS.description = "Среднее совпадение ключевой фразы с тегами h2.";
  
  var h3CS = this.tryCatch(this.prettyTagCS, ["h3"]);
  h3CS.name = "h3CS";
  h3CS.ru_name = "СССЗ(h3)"; 
  h3CS.description = "Среднее совпадение ключевой фразы с тегами h3.";
  
  var h2Count = this.tryCatch(this.tagCount, ["h2"]);
  h2Count.name = "h2Count";
  h2Count.ru_name = "счет (h2)"; 
  h2Count.description = "Количество тегов h2.";
  
  var h3Count = this.tryCatch(this.tagCount, ["h3"]);
  h3Count.name = "h3Count";
  h3Count.ru_name = "счет (h3)"; 
  h3Count.description = "Количество тегов h3.";
  
  var h2CSAvg = this.tryCatch(this.tagCSAvg, ["h2"]);
  h2CSAvg.name = "h2CSAvg";
  h2CSAvg.ru_name = "взвешенное ССЗ(h2)"; 
  h2CSAvg.description = "взвешенное ССЗ(h2)= (ССЗ(h2(1))+ССЗ(h2(2))+ ...+ССЗ(h2(n)))/n, где n = счет(h2).";
  
  var h3CSAvg = this.tryCatch(this.tagCSAvg, ["h3"]);
  h3CSAvg.name = "h3CSAvg";
  h3CSAvg.ru_name = "взвешенное ССЗ(h3)"; 
  h3CSAvg.description = "взвешенное ССЗ(h3)= (ССЗ(h3(1))+ССЗ(h3(2))+ ...+ССЗ(h3(n)))/n, где n = счет(h3).";
  
  var titleLength = this.tryCatch(this.tagLengthAll, ["title"]);
  titleLength.name = "titleLength";
  titleLength.ru_name = "Длина в символах title"; 
  titleLength.description = "Длина в символах тега title";
  
  var h1Length = this.tryCatch(this.tagLengthAll, ["h1"]);
  h1Length.name = "h1Length";
  h1Length.ru_name = "Длина в символах h1"; 
  h1Length.description = "Длина в символах тега h1";
  
  var h2Length = this.tryCatch(this.tagLengthAll, ["h2"]);
  h2Length.name = "h2Length";
  h2Length.ru_name = "Длина в символах h2"; 
  h2Length.description = "Длина в символах тега h2";
  
  var h2LengthFirst = this.tryCatch(this.tagLengthFirst, ["h2"]);
  h2LengthFirst.name = "h2LengthFirst";
  h2LengthFirst.ru_name = "Длина в символах h2(1)"; 
  h2LengthFirst.description = "Длина в символах первого тега h2";

  var h2LengthAvg = this.tryCatch(this.tagLengthAvg, ["h2"]);
  h2LengthAvg.name = "h2LengthAvg";
  h2LengthAvg.ru_name = "Длина в символах h2 avg"; 
  h2LengthAvg.description = "Взвешенная длина в символах тега h2";

  var h3Length = this.tryCatch(this.tagLengthAll, ["h3"]);
  h3Length.name = "h3Length";
  h3Length.ru_name = "Длина в символах h3"; 
  h3Length.description = "Длина в символах тега h3";
  
  var h3LengthFirst = this.tryCatch(this.tagLengthFirst, ["h3"]);
  h3LengthFirst.name = "h3LengthFirst";
  h3LengthFirst.ru_name = "Длина в символах h3(1)"; 
  h3LengthFirst.description = "Длина в символах первого тега h3";

  var h3LengthAvg = this.tryCatch(this.tagLengthAvg, ["h3"]);
  h3LengthAvg.name = "h3LengthAvg";
  h3LengthAvg.ru_name = "Длина в символах h3 avg"; 
  h3LengthAvg.description = "Взвешенная длина в символах тега h3";

  var sList = this.tryCatch(this.getSearchPicksConcat, []);
  sList.name = "sList";
  sList.ru_name = "Выдача"; 
  sList.description = "Посиковая выдача на страничке (google,yandex)";

  var params = [
         sList,titleCS, h1CS, h2CS, h3CS, h2Count, h3Count,
         h2CSAvg, h3CSAvg, titleLength, h1Length, 
         h2Length, h2LengthFirst, h2LengthAvg, 
         h3Length, h3LengthFirst, h3LengthAvg
  ];
  return params;
}  
//процент вхождения фразы в первом тэге tag
SeoParameters.prototype.tagCSFirst = function (tag) {
    
    if (this.parser.getTag(tag).length>0) {
        //console.log("процент вхождения фразы для ", tag);
        var data = getData(this.parser.getTag(tag)[0].children);
        return this.complianceStrings(data, this.keyText)
    }
    throw new Error( 'Нет тега ' + tag);
}
// процент вхождения фразы среди всех тэгов tag
SeoParameters.prototype.tagCS = function (tag) {
    var tags = this.parser.getTag(tag);
    var res = [];
    if (tags.length>0) {
        for (var i=0; i<tags.length; i++) {
            //console.log("процент вхождения фразы для ", tag, i);
            var data = getData(tags[i].children);
            var num = 1 + i;
            res.push(this.complianceStrings(data, this.keyText))
        }
        return res;
    }
    throw new Error( 'Нет тега ' + tag);
}

//массив в строку - по красивее вывод
SeoParameters.prototype.prettyTagCS = function (tag) {
  var res = this.tagCS(tag);
  var res1 = "";
  for (var i=1; i<res.length+1; i++) {
      res1 += i + " - "  + res[i-1] + "; ";
  }
  return res1;
}
//this.parser.getTag
SeoParameters.prototype.getTag = function (tag) {
  return this.parser.getTag(tag);
}
//средний процент вхождения фразы среди всех тэгов tag
SeoParameters.prototype.tagCSAvg = function (tag) {
    var cnt = 0;
    var tags = this.parser.getTag(tag);
    if (tags.length>0) {
        for (i in tags) {
            //console.log(this.parser.getTag(tag)[0].children);
            var data = getData(tags[i].children);
            cnt += this.complianceStringsVal(data, this.keyText)
        }
        return (cnt/tags.length).toFixed(2) + '%';;
    }
    throw new Error( 'Нет тега ' + tag);
}
//количество блоков с тэгом tag
SeoParameters.prototype.tagCount = function (tag) {
  var tags = this.parser.getTag(tag);
  if (tags.length>0) {
    return tags.length;
  }
  throw new Error( 'Нет тега ' + tag);
}
//считаем суммарную длину в символах data всех тэгов tag
SeoParameters.prototype.tagLengthAll = function (tag) {
    var tags = this.parser.getTag(tag);
    
    if(!tags || tags.length == 0)
        throw new Error( 'Нет тега ' + tag);
    var data = getData(tags);
    
    return data.length;
}
//считаем суммарную длину в символах data первого тэга tag
SeoParameters.prototype.tagLengthFirst = function (tag) {
    var tags = this.parser.getTag(tag);
    if(!tags || tags.length == 0)
        throw new Error( 'Нет тега ' + tag);
        
    var data = getData(tags[0]);
    return data.length;
}
//считаем среднюю длину в символах data среди всех тэгов tag
SeoParameters.prototype.tagLengthAvg = function (tag) {
    var tags = this.parser.getTag(tag);
    if(!tags || tags.length == 0)
        throw new Error( 'Нет тега ' + tag);
    var data = getData(tags);
    var count = tags.length;
    return data.length/count;
}
//получаем data тэга tag
function getData(obj) {
    if (!obj)
        return "";
    var out = '';
    //воспринимаем это как НЕ массив
    if (obj.hasOwnProperty('children')) {
        out += getData(obj.children);
    }
    if (obj.hasOwnProperty('data')) {
        out += obj.data;
    }
    //воспринимаем это как массив
    for (var j=0; j< obj.length; j++) {
        if (obj[j].hasOwnProperty('children')) {
            out += getData(obj[j].children);
        }
        if (obj[j].hasOwnProperty('data')) {
            out += obj[j].data;
        }
    }
    return out;
}

//по 
SeoParameters.prototype.getSearchSystem = function (url) {
    if(url.indexOf('google') > -1)
        return 'google';
    if(url.indexOf('yandex') > -1)
        return 'yandex';
    return undefined;
}
//получаем поисковыую выдачу
//{url: .. , title: .. ,}
//TODO это реклама?
SeoParameters.prototype.getSearchPicks = function () {
    var searchSystem = this.getSearchSystem(this.url);
    if (searchSystem == undefined)
        return undefined;
    var res = [];
    var aHref = '';
    //маска построения результата выдачи 
    //в зависимости от посиковой системы
    var aMask = '';
    if (searchSystem == 'google')
        aMask = 'li h3 a';
    if (searchSystem == 'yandex')
        aMask = 'h2 a';
    //парсим страницу
    var a = this.getTag(aMask);
    //получаем URL-ы и title-ы
    for (i in a){
        var el = {};
        var tmp = a[i];
        //если нет атрибутов, то выходим
        if(!tmp.hasOwnProperty('attribs'))
            continue;
        //если не отображается, то выходим
        if(tmp.attribs['style'] == 'display:none')
            continue;
        //если нет URL-а, то выходим
        if(tmp.attribs['href'] == undefined)
            continue;
        //получаем URL
        el.url = tmp.attribs['href'];
        //получаем title
        el.title = getData(tmp);
        //кладем в результат
        res.push(el);
    }
    return res;
}
//получаем строку из списка выдачи + ссылка
SeoParameters.prototype.getSearchPicksConcat = function () {
    var aHref = '';
    //парсим страницу
    var a = this.getSearchPicks();
    //получаем URL-ы и title-ы
    for (i in a){
        aHref = aHref + '<br>' + a[i].title + ' - <a href = "' + a[i].url + '" >' + 'ссылка' + '</a>'; 
    }
    return aHref;
}

//получаем массив ссылок из списка выдачи + ссылка
SeoParameters.prototype.getSearchPicksArray = function () {
    var aHref = [];
    //парсим страницу
    var a = this.getSearchPicks();
    //получаем URL-ы и title-ы
    for (i in a){
        aHref = aHref.push({title: a[i].title, url: a[i].url});
    }
    return aHref;
}

module.exports = SeoParameters;