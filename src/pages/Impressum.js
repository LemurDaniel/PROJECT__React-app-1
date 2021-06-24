import React from 'react'


const Impressum = () => {

  return (
    <div className="p-10 md:p-20">


      <div className="text-white mx-auto">
        <h1 className="text-xl underline pb-2">Impressum:</h1>

        <p>Diese Website ist ein rein privates Projekt ohne jeglichen kommerziellen Nutzen und unterliegt daher nach dem
          <a href="https://www.gesetze-im-internet.de/tmg/__5.html" className="hover:underline italic"> Telemediengesetz (TMG) § 5 Allgemeine Informationspflichten </a>
          keinen impressumspflichtigen Angaben.
        </p>

      </div>


      <div className="text-white mx-auto mt-10">
        <h1 className="text-xl underline pb-2">Datenschutz:</h1>

        <p>
          Die Website erhebt und speichert folgende unten aufgelistete nutzerbezogene Daten bei normaler Registrierung.
          Bei dem Anmelden als Gast, wird ein einmaliges 12-Stunden gültiges Wegwerf-Konto erstellt, das lediglich einen <i>UserDisplayName</i> erfragt.
        </p>

        <ul className="list-disc pl-5 py-5">
          <li className="py-1 border-b rounded-sm border-gray-600">
            <i>UserDisplayName: </i>
            <p> Der öffentliche Nutzername dient zur Zuordnung von Bildern in der Bildergallerie und den Highscores. </p>
          </li>

          <li className="py-1 border-b rounded-sm border-gray-600">
            <i>Nutzername: </i>
            <p> Der eindeutige Identifikationsname des Kontos ist für niemanden außer des Kontoerstellers sichtbar. </p>
          </li>

          <li className="py-1 border-b rounded-sm border-gray-600">
            <i>Passwort: </i>
            <p> Das Passwort wird mit einer Implementation der
              <a href="https://en.wikipedia.org/wiki/Bcrypt" className="hover:underline italic"> Bcrypt Hash-Funktion </a>
              sicher und unleserlich gespeichert.
            </p>
          </li>

          <li className="py-1 border-b rounded-sm border-gray-600">
            <i>doodle_token: </i>
            <p> Ein Cookie zur Speicherung von Session Identifkationsdaten, dass nach der Registrierung oder des Logins angelegt wird und dessen Inhalt durch den
              <a href="https://de.wikipedia.org/wiki/Advanced_Encryption_Standard" className="hover:underline italic"> AES-256 Algorithmus </a> verschlüsselt wurde.
            </p>
          </li>

        </ul>

      </div>


    </div>

  )
}

export default Impressum
