import './style.scss';

interface OnChange {
  (newValue: boolean): void;
}

export default function Switch({ onChange, value }: { onChange: OnChange, value: boolean }) {
  return (
    <button className={`Switch ${value ? 'on' : ''}`} onClick={() => onChange(!value)}>
      <div></div>
    </button>
  );
}
