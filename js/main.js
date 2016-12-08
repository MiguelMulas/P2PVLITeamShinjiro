var battle = new RPG.Battle();
var actionForm, spellForm, targetForm;
var infoPanel;

function prettifyEffect(obj) {
    return Object.keys(obj).map(function (key) {
        var sign = obj[key] > 0 ? '+' : ''; // show + sign for positive effects
        return `${sign}${obj[key]} ${key}`;
    }).join(', ');
}


battle.setup({
    heroes: {
        members: [
            RPG.entities.characters.heroTank,
            RPG.entities.characters.heroWizard
        ],
        grimoire: [
            RPG.entities.scrolls.health,
            RPG.entities.scrolls.fireball
        ]
    },
    monsters: {
        members: [
            RPG.entities.characters.monsterSlime,
            RPG.entities.characters.monsterBat,
            RPG.entities.characters.monsterSkeleton,
            RPG.entities.characters.monsterBat
        ]
    }
});

battle.on('start', function (data) {
    console.log('START', data);
});
var show = function mostrarPers (interfazHTML,nombrePers,lista)
    {
        var i = 0;
        var nodo;
        var personaje;
        nodo = interfazHTML.querySelector('[class=character-list]');
        nodo.innerHTML = "";
        for (var character in lista)
        {
            var li = document.createElement('li');
            personaje = lista[character];
            li.innerHTML += personaje.name + " (HP:" + '<strong>' +  personaje.hp + '</strong>' + "/" + 
            personaje.maxHp + ", MP: " + '<strong>' + personaje.mp + '</strong>'+ "/" + personaje.maxMp + ")";
            li.dataset.charaId = nombrePers[i]; 
            nodo.appendChild(li);
            ++i;
        }
    }
function createPanel(nodo, opciones){
    nodo.innerHTML = "";
    for (var i = 0; i < opciones.length ; i++) {
        nodo.innerHTML += `<li><label><input type = "radio" name="option" value = "${opciones[i]}" required> ${opciones[i]}</label></li>`;
    };
};
battle.on('turn', function (data) {
    console.log('TURN', data);
    // TODO: render the characters
    var Hlista = this.characters.allFrom("heroes");
    var nomHeroes = Object.keys(Hlista);
    var HeroesTML = document.getElementById('heroes');
    var Mlista = this.characters.allFrom("monsters");
    var nomMonstruos = Object.keys(Mlista);
    var HTMonstersL  = document.getElementById('monsters');

    show(HeroesTML,nomHeroes,Hlista);
    show(HTMonstersL,nomMonstruos,Mlista);
    // TODO: highlight current character
    var personajeActual = document.querySelector('[data-chara-id= '+ data.activeCharacterId +']');//es posible que se haga con queryselectorall
    personajeActual.classList.add('active');
    // TODO: show battle actions form
    var opcionAct = actionForm.querySelector('[class=choices]');
    var listaOpciones = this.options.list();
    opcionAct.innerHTML = "";

    listaOpciones.forEach(function(accion){
        var li = document.createElement('li');
        li.innerHTML = '<label><input type="radio" name="option" value=' + accion + '> <strong>' + accion + '</strong></label>'
        opcionAct.appendChild(li);
    });

    actionForm.style.display = 'inline';

    var personajess = this._charactersById;
    var objetivo = targetForm.querySelector('[class=choices]');
    objetivo.innerHTML = "";

    for (var i in personajess){
        if (personajess[i]._hp > 0){
            var li = document.createElement('li');

            if (personajess[i].party === "heroes"){
                li.innerHTML += '<heroe><label><input type="radio" name="option" value="' + i +  '" required> ' + i + '</label></heroe>';
            }
            else li.innerHTML += '<monst><label><input type="radio" name="option" value="' + i +  '" required> ' + i + '</label></monst>';

            objetivo.appendChild(li);
        }
    }

    var hechizos = this._grimoires[this._activeCharacter.party];
    var objetivoHechizo = spellForm.querySelector('[class=choices]');
    objetivoHechizo.innerHTML = "";
    
    for (var i in hechizos){
        var li = document.createElement('li');
        li.innerHTML += '<label><input type="radio" name="option" value="' + i +  '" required> ' + i + '</label>';
        objetivoHechizo.appendChild(li);
    }
});

battle.on('info', function (data) {
    console.log('INFO', data);

    // TODO: display turn info in the #battle-info panel
});

battle.on('end', function (data) {
    console.log('END', data);

    // TODO: re-render the parties so the death of the last character gets reflected
    // TODO: display 'end of battle' message, showing who won
});

window.onload = function () {
    actionForm = document.querySelector('form[name=select-action]');
    targetForm = document.querySelector('form[name=select-target]');
    spellForm = document.querySelector('form[name=select-spell]');
    infoPanel = document.querySelector('#battle-info');

    actionForm.addEventListener('submit', function (evt) {
        evt.preventDefault();

        // TODO: select the action chosen by the player
        var accion = actionForm.elements['option'].value;
        battle.options.select(accion);

        // TODO: hide this menu
        actionForm.style.display = 'none';

        // TODO: go to either select target menu, or to the select spell menu
        if(accion === 'attack'){
            targetForm.style.display = 'block';
        }
        else if(accion ==='cast'){
            spellForm.style.display = 'block';
        }
    });

    targetForm.addEventListener('submit', function (evt) {
        evt.preventDefault();
        // TODO: select the target chosen by the player
        var objetivo = targetForm.elements['option'].value;
        battle.options.select(objetivo);
        // TODO: hide this menu
        targetForm.style.display = 'none';
    });

    targetForm.querySelector('.cancel')
    .addEventListener('click', function (evt) {
        evt.preventDefault();
        // TODO: cancel current battle options
        // TODO: hide this form
        // TODO: go to select action menu
    });

    spellForm.addEventListener('submit', function (evt) {
        evt.preventDefault();
        // TODO: select the spell chosen by the player
        var hechizo = spellForm.elements['option'].value;
        battle.options.select(hechizo);
        // TODO: hide this menu
        spellForm.style.display = 'none';
        // TODO: go to select target menu
        targetForm.style.display = 'block';
    });

    spellForm.querySelector('.cancel')
    .addEventListener('click', function (evt) {
        evt.preventDefault();
        // TODO: cancel current battle options
        // TODO: hide this form
        // TODO: go to select action menu
    });

    battle.start();
};
