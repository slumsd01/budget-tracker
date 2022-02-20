let db;
const request = indexedDB.open('budget_tracker', 1)

// after version changes
request.onupgradeneeded = function(event) {
    const db = event.target.result

    // create object store
    db.createObjectStore('new_transaction', {autoIncrement: true})
}

// after successful connection
request.onsuccess = function(event) {
    db = event.target.result

    if (navigator.onLine) {
        uploadTransaction()
    }
}

// after failed connection
request.onerror = function(event) {
    console.log(event.target.errorCode)
}

// to submit a new transaction without internet connection
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite')
    const transactionObjectStore = transaction.objectStore('new_transaction')
    transactionObjectStore.add(record)
}

// upload transaction data
function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite')
    const transactionObjectStore = transaction.objectStore('new_transaction')

    // get records from store & set to variable
    const getAll = transactionObjectStore.getAll()

    // after succesfull getAll
    getAll.onsuccess = function() {
        // send data from store to api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse)
                }
                // open db transaction again to clear store
                const transaction = db.transaction(['new_transaction'], 'readwrite')
                const transactionObjectStore = transaction.objectStore('new_transaction')
                transactionObjectStore.clear()
                alert('All saved transactions have been submitted.')
            })
            .catch(err => {
                console.log(err)
            })
        }
    }
}

// listen for app coming back online
window.addEventListener('online', uploadTransaction)