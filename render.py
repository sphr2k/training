from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parent


def title(name: str) -> str:
    return name.replace('_', ' ').title()


def main() -> None:
    data = yaml.safe_load((ROOT / 'program.yaml').read_text())

    lines = [
        '# Training',
        '',
        '> Generated from `program.yaml`. Edit the YAML, not this file.',
        '',
        f"## {data['name']}",
        '',
        'Priorities: ' + ', '.join(f"**{p}**" for p in data['principles']['priorities']) + '.',
        '',
    ]

    for day, exercises in data['sessions'].items():
        lines += [f'### Day {day}', '', '| Pattern | Sets | Reps |', '|---|---:|---:|']
        for ex in exercises:
            lines.append(f"| {title(ex['pattern'])} | {ex['sets']} | {ex['reps']} |")
        lines.append('')

    lines += [
        '## Rules',
        '',
        f"- Compounds: **{data['principles']['effort']['compounds']}**.",
        f"- Isolations: **{data['principles']['effort']['isolations']}**.",
        f"- {data['principles']['progression']['rule']}",
        f"- {data['principles']['pain']['rule']}",
        f"- {data['principles']['fatigue']['rule']}",
        '',
        '## Weekly target volume',
        '',
        '| Pattern / muscle | Sets |',
        '|---|---:|',
    ]

    for pattern, sets in data['weekly_volume'].items():
        lines.append(f'| {title(pattern)} | {sets} |')

    lines += [
        '',
        '## Editing',
        '',
        '`program.yaml` is the source of truth. Regenerate this README with:',
        '',
        '```bash',
        'uv run python render.py',
        '```',
        '',
    ]

    (ROOT / 'README.md').write_text('\n'.join(lines))


if __name__ == '__main__':
    main()
