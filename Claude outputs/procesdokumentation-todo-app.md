# Procesdokumentation: ToDo-app

Vi skulle lave en ToDo-app som en del af vores undervisning. Appen opfylder minimumskravene:

- Oprette en ny opgave med et unikt ID og en beskrivelse.
- Tillade brugerne at markere opgaver som "færdige", hvorefter de flyttes til en "Færdig"-liste.
- Tillade brugerne at fortryde færdiggørelsen af en opgave, så den ryger tilbage til "ToDo"-listen.
- Tillade brugerne at slette opgaver.
- Markere en task som "udendørs" og hente aktuelt vejr via et gratis vejr-API og bruge det til at markere, hvilke opgaver der kan udføres når de er markeret som "udendørs".

Derudover har jeg tilføjet en light & dark mode, og selvom det ikke står i kravene, er det implicit at appen også skal kunne passe til en telefonskærm, så det er også blevet efterfulgt i min opgave. Appen gemmer også brugerens valg efter reload med brug af localStorage. En ekstra ting jeg har tilføjet er, at man ikke kan tilføje en opgave uden at have givet den en beskrivelse/navn. Og så har jeg stylet lidt på den, så appen er nem og behagelig at bruge.

## Datamodellen

Appen har en liste i hukommelsen, `task_arr`, og en liste på skærmen. Listen i hukommelsen er den sande, og den der vises på skærmen er kun til visning. Det smarte ved det er, at man så kun skal rette ét sted i koden: hukommelsen. Skærmvisningen tegnes forfra ved hver rettelse, fordi funktionerne kalder `renderList()`, som er det der tegner listen op fra hukommelsen.

`task_arr` er data, som vi kan lægge i localStorage. Det kunne vi ikke med skærmlisten — den har masser af CSS-regler liggende på sig.

## Nedslag i koden

Jeg havde en del problemer med at få alle delene med, og det fandt jeg hurtigt ud af ved hjælp af konsollen. Der var mange steder hvor jeg prøvede at bruge et element, før jeg havde oprettet det i min kode, og også mange `const`'er som kun fandtes inde i en funktion, men som jeg prøvede at bruge uden for den gældende funktion. Her er et par stykker af de fejl, jeg havde det sværest med.

### 1. Rækkefølge i DOM-manipulation

Fejlen i konsollen lød: `Uncaught ReferenceError: Cannot access 'li' before initialization`.

Det der skete her var, at jeg prøvede at komme til en slet-knap inde i `li`-elementet, men `li`-elementet var ikke engang oprettet endnu, så det crashede selvfølgelig hele appen. Jeg lærte her, at rækkefølge betyder alt i DOM-manipulation. Man kan ikke finde noget i et element, før man har oprettet elementet — og så skal man selvfølgelig også have puttet den knap, man leder efter, ind i det element, man lige har oprettet.

Jeg gjorde den her fejl flere gange i min opgave, hvor jeg f.eks. skrev `<p${task.outside ? ...}>` inde i starttagget i stedet for efter det. Det viste, hvordan jeg begge gange ikke helt havde læst min kode op for mig selv og forstået rækkefølgen.

### 2. Hvor skal API-kaldet ligge?

Den næste del af koden, jeg vil skrive lidt om, er API-kaldet. Jeg ville gerne have at vejret blev hentet frisk på min side, så når man gik ind og kiggede på sine ToDo-opgaver, kunne man se om man kunne gøre det nu, eller om det regnede, eller om det ville regne på den dag man ville gøre det på. Så jeg tænkte, at jeg ville hente det i `renderList()`.

Men det ville have været en fejl, fordi så ville kaldet komme hver gang nogen klikkede på stort set alt på min side — checkbox, add task, done task, outdoors task. Det ville blive til virkelig mange API-kald, som hverken ville være nødvendige eller give det aktuelle vejr, jeg ledte efter.

Jeg valgte så i stedet, at vejret skulle hentes i `createTask`, så det kun sker én gang, når tasken laves, og det bliver gemt som `task.rain` på objektet. Ved genindlæsning af siden henter jeg så vejret igen for de udendørs tasks. `renderList()` læser kun modellen og tegner derudfra.

Det jeg lærte af det var, at en funktion skal have ét job. Jeg splittede vejret ud i sin egen funktion, hvilket gjorde det nemmere at fejlfinde på lige præcis den funktion, før jeg koblede den på noget andet.

### 3. Strengen "null" der opførte sig som data

Tredje kodenedslag jeg vil komme ind på: konsollen sagde `Cannot read properties of null (reading 'forEach')`. `null` opførte sig som data.

Sådan så koden ud:

```js
if (opgaver) {
  task_arr = JSON.parse(opgaver);
}
```

Det ser rigtigt ud, men i localStorage stod der `"null"`, og det gjorde der fordi en ikke-tom streng i JavaScript er sand. Så `if`'et ville altid komme igennem og sørge for, at `task_arr` ikke ville være noget alligevel.

Hvad jeg lærte af det: for det første, at localStorage kun kan gemme tekst, og at `JSON.stringify`/`JSON.parse` er den måde, man kommer ind og ud af localStorage. For det andet, at "sandt" i JavaScript ikke er lig med "gyldigt" — f.eks. er `"null"`, `"0"` og `"false"` alle sande som strenge. Fejlen lå i noget data, som havde overlevet fra en tidligere version af min kode. Jeg lærte at rydde localStorage i Application-fanen som første fejlfindingsskridt, når noget gemt opfører sig mærkeligt.
