type Claim = { text: string; citations: Array<{ pdf_page: number; manual_page: string | null }> }

export function AnswerBody({ text, claims }: { text: string; claims: Claim[] }) {
  return (
    <div className="answer-copy">
      <p>{text}</p>
      {claims.map((claim, index) => (
        <div className="claim" key={`${claim.text}-${index}`}>
          <strong>{claim.text}</strong>
          <div className="citation-row">
            {claim.citations.map((citation) => (
              <span className="citation" key={`${citation.pdf_page}-${citation.manual_page}`}>
                Manual {citation.manual_page ?? '—'} · PDF {citation.pdf_page}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
