var battle = new RPG.Battle();
var actionForm, spellForm, targetForm;
var infoPanel;

function prettifyEffect(obj) {
    return Object.keys(obj).map(function (key) {
        var sign = obj[key] > 0 ? '+' : ''; // show + sign for positive effects
        return `${sign}${obj[key]} ${key}`;
    }).join(', ');
}

function JuegoAleatorio(party){
    var numCombatientes = Math.floor(Math.random() * 4) + 1;
    var combatientes = [];
    if (party === 'heroes'){
        for(var i = 0; i < numCombatientes; ++i){
            var rdm1 = Math.floor(Math.random() * 2) + 1;
            if(rdm1 === 1) combatientes[i] = RPG.entities.characters.heroTank;
            else combatientes[i] = RPG.entities.characters.heroWizard;
        }

    }
    else {
        for(var i = 0; i < numCombatientes; ++i){
            var rdm2 = Math.floor(Math.random() * 3) + 1;
            if(rdm2 === 1) combatientes[i] = RPG.entities.characters.monsterBat;
            else if (rdm2 === 2) combatientes[i] = RPG.entities.characters.monsterSkeleton;
            else combatientes[i] = RPG.entities.characters.monsterSlime;
        }
    }
    return combatientes;
}

battle.setup({
    heroes: {
        members: JuegoAleatorio('heroes'),
        /*members: [
            /*RPG.entities.characters.heroTank,
            RPG.entities.characters.heroWizard
            members
        ],*/
        grimoire: [
            RPG.entities.scrolls.health,
            RPG.entities.scrolls.fireball
        ]
    },
    monsters: {
        members: JuegoAleatorio('monsters')
        /*members: [
            RPG.entities.characters.monsterSlime,
            RPG.entities.characters.monsterBat,
            RPG.entities.characters.monsterSkeleton,
            RPG.entities.characters.monsterBat
        ]*/
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
            if (personaje.hp <= 0) li.classList.add('dead');
            li.innerHTML += personaje.name + " (HP:" + '<strong>' +  personaje.hp + '</strong>' + "/" + 
            personaje.maxHp + ", MP: " + '<strong>' + personaje.mp + '</strong>'+ "/" + personaje.maxMp + ")";
            li.dataset.charaId = nombrePers[i]; 
            nodo.appendChild(li);
            ++i;
        }
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
    var personajeActivo = data.activeCharacterId;
    var personajeAmarillo = document.querySelector ('[data-chara-id= "' + personajeActivo + '" ]');
    personajeAmarillo.classList.add ('active');
    // TODO: show battle actions form

    actionForm.style.display = 'block';

    var opcionAct = actionForm.querySelector('[class=choices]');
    var listaOpciones = this.options.list();
    opcionAct.innerHTML = "";

    listaOpciones.forEach(function(accion){
        var li = document.createElement('li');
        li.innerHTML = '<label><input type="radio" name="option" value="' + accion +  '" required> ' + accion + '</label>';
        opcionAct.appendChild(li);
    });

    var personajess = this._charactersById;
    var objetivo = targetForm.querySelector('[class=choices]');
    objetivo.innerHTML = "";

    for (var i in personajess){
        if (personajess[i]._hp > 0){
            var li = document.createElement('li');

            if (personajess[i].party === 'monsters')
                li.innerHTML += '<colorMonsters><label><input type="radio" name="option" value="' + i +  '" required> ' + i + '</label></colorMonsters>';
            else
                li.innerHTML += '<colorHeroes><label><input type="radio" name="option" value="' + i +  '" required> ' + i + '</label></colorHeroes>';
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
    if (this._activeCharacter._mp <= 0 || objetivoHechizo.innerHTML === "") spellForm.querySelector('[type=submit]').disabled = true;
    else spellForm.querySelector('[type=submit]').disabled = false;


});

battle.on('info', function (data) {
    console.log('INFO', data);

    // TODO: display turn info in the #battle-info panel
    infoPanel.innerHTML = '<strong>' + data.activeCharacterId + '</strong>';
    if (data.action === 'attack') {
        infoPanel.innerHTML += ' le ha dado una colleja a <strong>' + data.targetId + '</strong> ';
        if (data.success) {
            var effectsTxt = prettifyEffect(data.effect || {});
            infoPanel.innerHTML += ' y causó ' + effectsTxt + '.';
        }
        else {
            infoPanel.innerHTML += ' pero... ¡Fracasó estrepitósamente y <strong>' + data.targetId + '</strong> se rió de él!';
        }
    }
    else if (data.action === 'cast') {
        infoPanel.innerHTML += ' se sacó la varita, usó <i>' + data.scrollName + '</i>';
        if (data.success) {
            var effectsTxt = prettifyEffect(data.effect || {});
            infoPanel.innerHTML += ' y causó ' + effectsTxt + ' a <strong>' + data.targetId + '</strong>.';
        }
        else {
            infoPanel.innerHTML += ' pero... ¡Fracasó estrepitósamente y <strong>' + data.targetId + '</strong> se rió de él!';
        }
    }
    else
    {
        infoPanel.innerHTML += ' se defendió';
        if (data.success) {
            infoPanel.innerHTML += '. ¡Su defensa aumenta a ' + data.newDefense + '!';
        }
        else {
            infoPanel.innerHTML += ' pero... ¡Fracasó estrepitósamente!';
        }
    }
});

battle.on('end', function (data) {
    console.log('END', data);

    var Hlista = this.characters.allFrom("heroes");
    var nomHeroes = Object.keys(Hlista);
    var HeroesTML = document.getElementById('heroes');
    var Mlista = this.characters.allFrom("monsters");
    var nomMonstruos = Object.keys(Mlista);
    var HTMonstersL  = document.getElementById('monsters');

    show(HeroesTML,nomHeroes,Hlista);
    show(HTMonstersL,nomMonstruos,Mlista);

    infoPanel.innerHTML = 'La sangrienta y larga batalla por fin ha terminado los <strong>' + data.winner +
     '</strong> se van a tomar magdalenas para celebrar la victoria.' + '<form name="reset"><p><button type="submit">Volver a jugar</button></p>';

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
        battle.options.cancel();
        // TODO: hide this form
        targetForm.style.display = 'none';
        // TODO: go to select action menu
        actionForm.style.display = 'block';
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
        battle.options.cancel();
        // TODO: hide this form
        spellForm.style.display = 'none';
        // TODO: go to select action menu
        actionForm.style.display = 'block';
    });

    battle.start();
};
