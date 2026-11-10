"""
Servicio de resolución didáctica de ecuaciones diferenciales con SymPy y NumPy.
Cálculo de pasos pedagógicos y curvas de solución.
"""
import math
import re
import sympy as sp
import numpy as np

def build_pedagogical_steps(eq, sol_gen, sol_part, x, y, x0, y0, y1, order):
    """
    Genera un desglose detallado y pedagógico paso a paso diseñado especialmente
    para estudiantes que están aprendiendo ecuaciones diferenciales.
    """
    steps = []
    
    # PASO 1: Identificación y variables
    steps.append({
        'num': 1,
        'titulo': 'Identificación de Variables y Forma Estándar',
        'descripcion': f'En esta ecuación diferencial identificamos:\n• Variable independiente: x (representa la entrada o el tiempo).\n• Función incógnita a determinar: y(x).\n• Derivada: representa la tasa instantánea de cambio de y respecto a x.\n\nEscribimos la ecuación en su forma matemática canónica:\n\n{sp.latex(eq)}',
        'tipo': 'setup'
    })
    
    # PASO 2: Clasificación pedagógica
    if order == 1:
        tipo_str = 'Ecuación Diferencial Ordinaria (EDO) de 1er Orden (involucra solo la primera derivada dy/dx)'
    elif order == 2:
        tipo_str = 'Ecuación Diferencial Ordinaria (EDO) de 2º Orden (involucra la segunda derivada d²y/dx²)'
    else:
        tipo_str = f'Ecuación Diferencial Ordinaria (EDO) de orden {order}'
        
    steps.append({
        'num': 2,
        'titulo': 'Clasificación y Tipo de Ecuación',
        'descripcion': f'Se clasifica como una {tipo_str}. El orden indica cuántas veces consecutivas se ha derivado la función incógnita.',
        'tipo': 'clasificacion'
    })
    
    diff_y = y(x).diff(x)
    diff2_y = y(x).diff(x, 2)
    
    if order == 1:
        try:
            dydx_sol = sp.solve(eq, diff_y)
            if dydx_sol:
                dydx = dydx_sol[0]
                has_y = y(x) in dydx.atoms(sp.Function)
                
                # CASO 1: Integración Directa (dy/dx = f(x))
                if not has_y:
                    steps.append({
                        'num': 3,
                        'titulo': 'Método de Integración Directa',
                        'descripcion': f'Como el miembro derecho depende únicamente de x, multiplicamos ambos miembros por el diferencial dx para aislar variables:\n\ndy = \\left({sp.latex(dydx)}\\right)dx',
                        'tipo': 'metodo'
                    })
                    f_int = sp.integrate(dydx, x)
                    steps.append({
                        'num': 4,
                        'titulo': 'Integración Indefinida de Ambos Miembros',
                        'descripcion': f'Aplicamos el operador integral ∫ a ambos lados de la igualdad:\n\n\\int dy = \\int \\left({sp.latex(dydx)}\\right)dx',
                        'tipo': 'integracion'
                    })
                    steps.append({
                        'num': 5,
                        'titulo': 'Cálculo de Antiderivadas y Constante C',
                        'descripcion': f'La integral de dy es simplemente y(x). Integrando el miembro derecho con las reglas del cálculo y sumando la constante C:\n\ny(x) = {sp.latex(f_int)} + C',
                        'tipo': 'algebra'
                    })
                else:
                    # CASO 2: Lineal en y: dy/dx = A*y + B => dy/dx + (-A)*y = B
                    A = dydx.diff(y(x))
                    B = sp.simplify(dydx - A*y(x))
                    is_linear_y = (y(x) not in A.atoms(sp.Function)) and (y(x) not in B.atoms(sp.Function))
                    
                    if is_linear_y and B == 0:
                        # Variables separables dy/y = A dx
                        steps.append({
                            'num': 3,
                            'titulo': 'Método de Separación de Variables',
                            'descripcion': f'Reordenamos la ecuación dividiendo entre y(x) y multiplicando por dx para agrupar variables:\n\n\\frac{{dy}}{{y}} = \\left({sp.latex(A)}\\right)dx',
                            'tipo': 'metodo'
                        })
                        int_A = sp.integrate(A, x)
                        steps.append({
                            'num': 4,
                            'titulo': 'Integración de Ambos Miembros',
                            'descripcion': f'Integramos ambos lados de la igualdad:\n\n\\int \\frac{{dy}}{{y}} = \\int \\left({sp.latex(A)}\\right)dx \\implies \\ln|y| = {sp.latex(int_A)} + c',
                            'tipo': 'integracion'
                        })
                        steps.append({
                            'num': 5,
                            'titulo': 'Despeje Exponencial de y(x)',
                            'descripcion': f'Aplicamos la función exponencial e^(·) a ambos lados para despejar y (e^ln|y| = |y|) y renombramos e^c como la constante C:\n\ny(x) = C \\cdot e^{{{sp.latex(int_A)}}}',
                            'tipo': 'algebra'
                        })
                    elif is_linear_y:
                        P = -A
                        Q = B
                        steps.append({
                            'num': 3,
                            'titulo': 'Forma Canónica Lineal de 1er Orden',
                            'descripcion': f'Escribimos la ecuación en la forma estándar y\' + P(x)y = Q(x), identificando:\n• P(x) = {sp.latex(P)}\n• Q(x) = {sp.latex(Q)}\n\n\\frac{{dy}}{{dx}} + \\left({sp.latex(P)}\\right)y = {sp.latex(Q)}',
                            'tipo': 'metodo'
                        })
                        int_P = sp.integrate(P, x)
                        mu = sp.exp(int_P)
                        steps.append({
                            'num': 4,
                            'titulo': 'Cálculo del Factor Integrante μ(x)',
                            'descripcion': f'El factor integrante μ(x) permite condensar el miembro izquierdo en la derivada de un producto. Se calcula mediante μ(x) = e^(∫ P(x) dx):\n\n\\mu(x) = e^{{\\int \\left({sp.latex(P)}\\right)dx}} = {sp.latex(mu)}',
                            'tipo': 'factor'
                        })
                        steps.append({
                            'num': 5,
                            'titulo': 'Multiplicación por μ(x) y Regla del Producto',
                            'descripcion': f'Multiplicamos toda la ecuación diferencial por μ(x). El lado izquierdo se convierte en la derivada d/dx[μ(x)·y(x)]:\n\n\\frac{{d}}{{dx}}\\left[{sp.latex(mu)} \\cdot y(x)\\right] = {sp.latex(sp.simplify(mu*Q))}',
                            'tipo': 'producto'
                        })
                        int_mu_Q = sp.integrate(mu * Q, x)
                        steps.append({
                            'num': 6,
                            'titulo': 'Integración y Despeje de y(x)',
                            'descripcion': f'Integramos con respecto a x y dividimos entre el factor integrante μ(x):\n\n{sp.latex(mu)} \\cdot y(x) = {sp.latex(int_mu_Q)} + C \\implies y(x) = \\frac{{{sp.latex(int_mu_Q)} + C}}{{{sp.latex(mu)}}}',
                            'tipo': 'despeje'
                        })
                    else:
                        steps.append({
                            'num': 3,
                            'titulo': 'Resolución por Separación e Integración Simbólica',
                            'descripcion': f'Separamos los diferenciales y resolvemos las integrales simbólicas correspondientes:\n\n{sp.latex(sol_gen)}',
                            'tipo': 'metodo'
                        })
        except Exception:
            pass
            
    elif order == 2:
        # Segundo orden
        try:
            lhs_diff = eq.lhs - eq.rhs
            a_coeff = lhs_diff.coeff(diff2_y)
            b_coeff = lhs_diff.coeff(diff_y)
            c_coeff = lhs_diff.coeff(y(x))
            
            if a_coeff != 0 and (diff2_y not in b_coeff.atoms(sp.Derivative)) and (diff_y not in c_coeff.atoms(sp.Derivative)):
                r = sp.Symbol('r')
                char_eq = sp.Eq(a_coeff*r**2 + b_coeff*r + c_coeff, 0)
                roots = sp.solve(char_eq, r)
                
                steps.append({
                    'num': 3,
                    'titulo': 'Planteamiento de la Ecuación Característica',
                    'descripcion': f'Para una EDO lineal homogénea con coeficientes constantes a·y\'\' + b·y\' + c·y = 0, proponemos una solución exponencial y = e^(rx). Al sustituir sus derivadas y\' = r e^(rx) e y\'\' = r² e^(rx), obtenemos el polinomio característico:\n\n{sp.latex(char_eq)}',
                    'tipo': 'caracteristica'
                })
                
                roots_str = ', '.join([sp.latex(rt) for rt in roots])
                steps.append({
                    'num': 4,
                    'titulo': 'Cálculo de las Raíces Características',
                    'descripcion': f'Resolvemos la ecuación cuadrática en r:\n\nr = {roots_str}',
                    'tipo': 'raices'
                })
                
                # Explicar la naturaleza de las raíces
                disc = b_coeff**2 - 4*a_coeff*c_coeff
                if disc < 0:
                    steps.append({
                        'num': 5,
                        'titulo': 'Raíces Complejas Conjugadas y Fórmula de Euler',
                        'descripcion': f'Como el discriminante es negativo, las raíces son números imaginarios/complejos de la forma α ± βi. Aplicando la fórmula de Euler (e^(iθ) = cos θ + i sin θ), la solución real se escribe combinando senos y cosenos:\n\ny(x) = C_1 \\cos(\\beta x) + C_2 \\sin(\\beta x)',
                        'tipo': 'euler'
                    })
                elif disc > 0:
                    steps.append({
                        'num': 5,
                        'titulo': 'Raíces Reales Distintas',
                        'descripcion': f'Como las dos raíces r₁ y r₂ son números reales distintos, la solución general es la superposición de dos exponenciales e^(r₁x) y e^(r₂x):\n\ny(x) = C_1 e^{{r_1 x}} + C_2 e^{{r_2 x}}',
                        'tipo': 'superposicion'
                    })
                else:
                    steps.append({
                        'num': 5,
                        'titulo': 'Raíz Real Repetida',
                        'descripcion': f'Al repetirse la raíz r, multiplicamos la segunda solución por x para asegurar que sean linealmente independientes:\n\ny(x) = (C_1 + C_2 x) e^{{r x}}',
                        'tipo': 'repetida'
                    })
        except Exception:
            pass

    # PASO: Solución General
    steps.append({
        'num': len(steps) + 1,
        'titulo': 'Solución General de la EDO (Familia de Curvas)',
        'descripcion': f'La familia infinita de curvas solución que satisfacen la ecuación diferencial es:\n\n{sp.latex(sol_gen)}\n\n💡 *Nota para estudiantes:* Cada valor posible de la constante C representa una curva diferente en el plano cartesiano.',
        'tipo': 'general'
    })
    
    # PASO: Condiciones iniciales PVI
    if sol_part is not None and y0 is not None:
        cond_desc = f'y({x0}) = {y0}' + (f', y\'({x0}) = {y1}' if y1 is not None and order > 1 else '')
        
        # Detalle de sustitución
        try:
            sx0 = sp.nsimplify(x0)
            sy0 = sp.nsimplify(y0)
            sub_lhs = sol_gen.rhs.subs(x, sx0)
            pvi_eq_latex = f'{sp.latex(sub_lhs)} = {sp.latex(sy0)}'
        except Exception:
            pvi_eq_latex = ''
            
        steps.append({
            'num': len(steps) + 1,
            'titulo': 'Aplicación del Problema de Valor Inicial (PVI)',
            'descripcion': f'Una condición inicial fija un punto exacto por donde debe pasar la curva. Al sustituir las condiciones {cond_desc} en la solución general:\n\n{pvi_eq_latex}',
            'tipo': 'pvi_eval'
        })
        
        steps.append({
            'num': len(steps) + 1,
            'titulo': 'Solución Particular Única',
            'descripcion': f'Despejando las constantes arbitrarias y reemplazándolas en la solución general, obtenemos la solución particular única que cumple las condiciones dadas:\n\n{sp.latex(sol_part)}',
            'tipo': 'particular'
        })
        
    return steps

def parse_and_solve_ode(eq_str, x0=0, y0=None, y1=None):
    """
    Parsea una ecuación diferencial en notación estándar y la resuelve con SymPy.
    Retorna la solución general, particular (si hay condiciones) y pasos explicativos.
    """
    x = sp.Symbol('x')
    y = sp.Function('y')
    
    clean_str = eq_str.strip()
    if '=' in clean_str:
        lhs_str, rhs_str = clean_str.split('=', 1)
    else:
        lhs_str, rhs_str = clean_str, '0'
        
    def transform_part(s):
        s = s.replace("d2y/dx2", "y(x).diff(x, 2)")
        s = s.replace("dy/dx", "y(x).diff(x)")
        s = s.replace("y''", "y(x).diff(x, 2)")
        s = s.replace("y'", "y(x).diff(x)")
        # Reemplazar y por y(x) cuando sea variable aislada
        s = re.sub(r'\by\b(?!\()', 'y(x)', s)
        # Soporte para potencias tipo ^ -> **
        s = s.replace('^', '**')
        return s

    lhs_expr_str = transform_part(lhs_str)
    rhs_expr_str = transform_part(rhs_str)
    
    local_dict = {
        'x': x, 'y': y,
        'exp': sp.exp, 'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan,
        'ln': sp.log, 'log': sp.log, 'e': sp.E, 'pi': sp.pi,
        'sqrt': sp.sqrt
    }
    
    lhs = sp.nsimplify(sp.parse_expr(lhs_expr_str, local_dict=local_dict))
    rhs = sp.nsimplify(sp.parse_expr(rhs_expr_str, local_dict=local_dict))
    eq = sp.Eq(lhs, rhs)
    
    # Clasificación y orden de la ecuación
    derivs = [d for d in eq.atoms(sp.Derivative) if d.expr == y(x)]
    order = max([len(d.variables) for d in derivs], default=1)
    
    # Resolver solución general
    sol_gen = sp.dsolve(eq, y(x))
    
    # Aplicar condiciones iniciales si se proporcionan
    ics = {}
    sx0 = sp.nsimplify(x0)
    if y0 is not None:
        ics[y(sx0)] = sp.nsimplify(y0)
    if y1 is not None and order > 1:
        ics[y(x).diff(x).subs(x, sx0)] = sp.nsimplify(y1)
        
    sol_part = None
    if ics:
        try:
            sol_part = sp.dsolve(eq, y(x), ics=ics)
        except Exception:
            try:
                # Fallback: sustituir en sol_gen y despejar constantes
                constants = list(sol_gen.free_symbols - {x})
                eq_ics = []
                if y0 is not None:
                    eq_ics.append(sp.Eq(sol_gen.rhs.subs(x, sx0), sp.nsimplify(y0)))
                if y1 is not None and order > 1:
                    eq_ics.append(sp.Eq(sol_gen.rhs.diff(x).subs(x, sx0), sp.nsimplify(y1)))
                c_sol = sp.solve(eq_ics, constants)
                if isinstance(c_sol, dict):
                    sol_part = sp.Eq(y(x), sol_gen.rhs.subs(c_sol))
                elif isinstance(c_sol, list) and len(c_sol) > 0:
                    sol_part = sp.Eq(y(x), sol_gen.rhs.subs(c_sol[0]))
            except Exception:
                sol_part = None

    # Generar pasos explicativos detallados y pedagógicos para estudiantes
    steps = build_pedagogical_steps(eq, sol_gen, sol_part, x, y, x0, y0, y1, order)

    # Generar puntos muestrales para graficar
    plot_points = []
    active_sol = sol_part if sol_part is not None else sol_gen
    try:
        rhs_func = active_sol.rhs
        # Si aún quedan constantes C1, sustituimos C1=1 para ilustrar
        free_symbols = rhs_func.free_symbols - {x}
        subs_dict = {sym: 1.0 for sym in free_symbols}
        eval_expr = rhs_func.subs(subs_dict)
        f_num = sp.lambdify(x, eval_expr, modules=['numpy', 'math'])
        
        xs = np.linspace(float(x0), float(x0) + 5.0, 100)
        for val_x in xs:
            try:
                val_y = float(f_num(val_x))
                if not math.isnan(val_y) and not math.isinf(val_y) and abs(val_y) < 1e5:
                    plot_points.append({"x": round(float(val_x), 3), "y": round(float(val_y), 4)})
            except Exception:
                continue
    except Exception:
        plot_points = []

    return {
        "latex_eq": sp.latex(eq),
        "latex_general": sp.latex(sol_gen),
        "str_general": str(sol_gen),
        "latex_particular": sp.latex(sol_part) if sol_part is not None else None,
        "str_particular": str(sol_part) if sol_part is not None else None,
        "order": order,
        "steps": steps,
        "plot_points": plot_points
    }
