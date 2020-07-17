const { t: typy } = require('typy')

module.exports.requestHeaders = {
  'Content-Type': 'application/json',
  ApiKey: process.env.API_KEY,
}

module.exports.mapApiItems = (items) => {
  const LOAN_TYPE = 'loan'
  const PHOTO_TYPE = 'photo'

  return typy(items).safeArray.map(item => {
    const type = (item.RequestType === 'Loan' ? LOAN_TYPE : PHOTO_TYPE)
    const output = {
      type: type,
      dueDate: (item.DueDate ? item.DueDate.split('T')[0] : ''), // 2017-06-28T00:00:00 => 2017-06-28
      status: item.TransactionStatus,
      transactionNumber: item.TransactionNumber,
      transactionDate: item.TransactionDate,
      creationDate: item.CreationDate,
      callNumber: item.CallNumber,
      issn: item.ISSN,
      illNumber: item.ILLNumber,
      documentType: item.DocumentType,
    }

    if (type === LOAN_TYPE) {
      Object.assign(output, {
        title: item.LoanTitle,
        author: item.LoanAuthor,
        edition: item.LoanEdition,
        publisher: item.LoanPublisher,
        placeOfPublication: item.LoanPlace,
        publicationDate: item.LoanDate,
        journalTitle: '',
        journalVolume: '',
        journalIssue: '',
        journalMonth: '',
        journalYear: '',
      })
    } else if (type === PHOTO_TYPE) {
      Object.assign(output, {
        title: item.PhotoArticleTitle,
        author: item.PhotoArticleAuthor,
        edition: item.PhotoItemEdition,
        publisher: item.PhotoItemPublisher,
        placeOfPublication: item.PhotoItemPlace,
        publicationDate: item.PhotoItemDate,
        journalTitle: item.PhotoJournalTitle,
        journalVolume: item.PhotoJournalVolume,
        journalIssue: item.PhotoJournalIssue,
        journalMonth: item.PhotoJournalMonth,
        journalYear: item.PhotoJournalYear,
      })
    }

    return output
  })
}
