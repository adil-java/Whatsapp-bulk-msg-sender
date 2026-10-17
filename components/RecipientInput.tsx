type RecipientInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function RecipientInput({ value, onChange, disabled }: RecipientInputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold" htmlFor="recipients">Recipients</label>
      <textarea
        id="recipients"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={5}
        placeholder={"03001234567\n03121234567\n03331234567"}
        className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
      />
      <p className="mt-2 text-xs text-slate-500">Use one number per line or separate numbers with commas.</p>
    </div>
  );
}

