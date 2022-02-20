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
        // uploadTransaction()
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