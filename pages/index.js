import Head from 'next/head'
import { Cursor, Client } from 'pg-browser'
import { useState, useEffect } from 'react'
import AgGrid from './AgGrid.js'
import ScrollSelectionForm from './ScrollSelectionForm.js'

export default function Home() {
  const [connected, setConnected] = useState(false)
  const [scrollOption, setScrollOption] = useState('Result Preview')
  const [inputBox, setInputBox] = useState('SELECT * FROM customer')
  const [text, setText] = useState(inputBox)
  const [cursor, setCursor] = useState(null)
  const [cursorClosed, setCursorClosed] = useState(false)

  const clientConfig = {
    database: 'dvdrental',
    user: 'bitdotio-2',
    password: 'password',
    port: '5901',
  }

  const cl = new Client(clientConfig)
  const [client, setClient] = useState(cl)

  const handleSubmit = (e) => {
    e.preventDefault();
    setText(inputBox)
  };

  const handleInputChange = (e) => {
    setInputBox(e.target.value)
  };

  const onConnectClick = () => {
    client.connect((err) => {
      if(err) {
        console.log(err)
        client.end()
        setClient(
          new Client(clientConfig)
        )
      } else {
        setConnected(true)
      }
    })
  }

  const onDisconnectClick = () => {
    const cb = () => {
      client.end()
      setConnected(false)
      setClient(
        new Client(clientConfig)
      )
      setCursor(null)
    }
    if (cursor && !cursorClosed) {
      cursor.moveAllAndClose(cb)
    } else {
      cb()
    }
  }

  const onStopStreamingClick = () => {
    if (!cursorClosed) {
      cursor.moveAllAndClose(() => {
        setCursorClosed(true)
      })
    }
  }

  // reset the cursor every time connection or text or scroll option changes
  useEffect(() => {
    if (connected && text) {
      getCursor().then(newCursor => {
        setCursor(newCursor)
        setCursorClosed(false)
      })
    }
  }, [connected, text, scrollOption])

  // returns a promise resolving to correct cursor (not placeholder)
  // closes the old cursor, if any
  const getCursor = () => {
    return new Promise((resolve, reject) => {
      if (!connected) {
        console.error("Attempt to make cursor with closed client")
        return null
      }
      if (cursor && !cursorClosed) {
        cursor.moveAllAndClose(() => {
          setCursorClosed(true)
          try {
            const newCursor = client.query(new Cursor(text))
            resolve(newCursor)
          } catch (e) {
            console.log('Error while creating cursor: ' + e.message)
            reject(e)
          }
        })
      } else {
        try {
          const newCursor = client.query(new Cursor(text))
          resolve(newCursor)
        } catch (e) {
          console.log('Error while creating cursor: ' + e.message)
          reject(e)
        }
      }
    })
  }

  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          ag-grid
        </h1>
        {connected ? (<div>
          <button onClick={onDisconnectClick}>
            Disconnect
          </button>
          <form onSubmit={handleSubmit}>
            <label>
              Query:
              <textarea type="text" name="query" value={inputBox} onChange={handleInputChange} />
            </label>
            <input type="submit" value="Submit" />
          </form>
          {cursor ? <div>
            <ScrollSelectionForm setScrollOption={setScrollOption} />
            <div key={scrollOption }>
              <AgGrid
                cursor={cursor}
                scrollOption={scrollOption}
              />
              <button onClick={onStopStreamingClick}>
                DONE/STOP streaming results
              </button>
            </div>
          </div>
            :
            null}
        </div>)
          :
          <button onClick={onConnectClick}>
            Connect to DB
          </button>}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
