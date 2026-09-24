interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <div className="pagination">
      <span>Page {page}</span>
      <div>
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}>‹</button>
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>›</button>
      </div>
    </div>
  );
}
