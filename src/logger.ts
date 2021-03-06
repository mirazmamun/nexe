import colors = require('chalk')
import ora = require('ora')

const frameLength = 120

export interface LogStep {
  modify(text: string, color?: string): void
  log(text: string, color?: string): void
}

export class Logger {
  private verbose: boolean
  private silent: boolean
  private ora: any
  private modify: Function
  public write: (text: string, color?: string) => void

  constructor(level: 'verbose' | 'silent' | 'info') {
    this.verbose = level === 'verbose'
    this.silent = level === 'silent'
    if (!this.silent) {
      this.ora = ora({
        text: 'Starting...',
        color: 'blue',
        spinner: 'dots'
      })
      this.ora.stop()
    }
    const noop = () => {}
    this.modify = this.silent ? noop : this._modify.bind(this)
    this.write = this.silent ? noop : this._write.bind(this)
  }

  flush() {
    !this.silent && this.ora.succeed()
    return new Promise(resolve => setTimeout(resolve, frameLength))
  }

  _write(update: string, color = 'green') {
    this.ora.succeed().text = (colors as any)[color](update)
    this.ora.start()
  }

  _modify(update: string, color = this.ora.color) {
    this.ora.text = update
    this.ora.color = color
  }

  step(text: string): LogStep {
    if (this.silent) {
      return { modify() {}, log() {} }
    }
    if (!this.ora.id) {
      this.ora.start().text = text
    } else {
      this.ora.succeed().text = text
      this.ora.start()
    }

    return {
      modify: this.modify,
      log: this.verbose ? this.write : this.modify
    } as LogStep
  }
}
