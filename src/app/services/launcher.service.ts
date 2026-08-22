import { Service } from '@angular/core';
import { Airport } from '../interfaces/airport';

@Service()
export class LauncherService {
  private readonly cache = new Map<string, Promise<string>>();

  async download(airport: Airport): Promise<void> {
    const { scriptPath, fileName, mimeType } = this.getPlatformData(airport.iata_code);
    if (!scriptPath) return;
    const url = this.buildUrl(airport.iata_code);
    try {
      let request = this.cache.get(scriptPath);
      if (!request) {request = fetch(scriptPath).then(res => {if (!res.ok) throw new Error(); return res.text();});
        this.cache.set(scriptPath, request);
      }
      const rawScript = await request;
      const finalScript = rawScript.replace('__FIDS_URL__', url);
      this.triggerDownload(finalScript, fileName, mimeType);
    } catch {
      return;
    }
  }

  private getPlatformData(iata: string) {
    const platform = navigator.platform;
    if (/Win/i.test(platform)) return { scriptPath: 'scripts/fids-launcher.bat', fileName: `OpenFIDS-${iata}.bat`, mimeType: 'application/bat' };
    if (/Linux/i.test(platform)) return { scriptPath: 'scripts/fids-launcher.sh', fileName: `OpenFIDS-${iata}.sh`, mimeType: 'application/x-sh' };
    return { scriptPath: null, fileName: '', mimeType: '' };
  }

  private buildUrl(iata: string): string {
    const base = document.querySelector('base')?.getAttribute('href') || '/';
    return `${window.location.origin}${base}?airport=${encodeURIComponent(iata)}`;
  }

  private triggerDownload(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
