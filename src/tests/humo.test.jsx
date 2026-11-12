import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

// Componente de juguete, solo para verificar la instalación
function Contador() {
  const [n, setN] = useState(0)
  return <button onClick={() => setN(n + 1)}>Clics: {n}</button>
}

describe('Instalación de testing', () => {
  it('incrementa al hacer clic', async () => {
    // 1. ARRANGE (preparar): dibujar el componente
    const user = userEvent.setup()
    render(<Contador />)

    // 2. ACT (actuar): hacer lo que haría una persona
    await user.click(screen.getByRole('button', { name: /clics: 0/i }))

    // 3. ASSERT (comprobar): verificar lo que se ve en pantalla
    expect(screen.getByRole('button', { name: /clics: 1/i })).toBeInTheDocument()
  })
})