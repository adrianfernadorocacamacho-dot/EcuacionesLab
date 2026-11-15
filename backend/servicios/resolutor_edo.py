"""
Servicio de resolución didáctica de ecuaciones diferenciales con SymPy y NumPy.
Cálculo de pasos pedagógicos y curvas de solución.
"""
import math
import re
import sympy as sp
import numpy as np
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor
)

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
        'descripcion': f'La familia infinita de curvas solución que satisfacen la ecuación diferencial es:\n\n{sp.latex(sol_gen)}\n\nNota pedagógica: Cada valor posible de la constante C representa una curva diferente en el plano cartesiano.',
        'tipo': 'general'
    })
    
    # PASO: Condiciones iniciales PVI
    if sol_part is not None and y0 is not None:
        cond_desc = f'y({x0}) = {y0}' + (f', y\'({x0}) = {y1}' if y1 is not None and order > 1 else '')
        
        # Detalle de sustitución
        try:
            sx0 = sp.nsimplify(x0)
            sy0 = sp.nsimplify(y0)
            sol_gen_item = sol_gen[0] if isinstance(sol_gen, list) and len(sol_gen) > 0 else sol_gen
            sub_lhs = sol_gen_item.rhs.subs(x, sx0) if hasattr(sol_gen_item, 'rhs') else sol_gen_item
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

def build_algebraic_steps(eq, sym, sol):
    """
    Genera un desglose didáctico y pedagógico paso a paso para ecuaciones
    algebraicas lineales, cuadráticas y polinomiales (ej: 5x + 3 = 4x + 6).
    """
    steps = []
    lhs = eq.lhs
    rhs = eq.rhs
    
    # PASO 1: Identificación y planteamiento
    steps.append({
        'num': 1,
        'titulo': 'Identificación y Planteamiento de la Ecuación',
        'descripcion': f'Identificamos la ecuación algebraica con la incógnita {sym}:\n\n{sp.latex(eq)}',
        'tipo': 'setup'
    })
    
    degree = None
    poly = None
    try:
        poly = sp.Poly(lhs - rhs, sym)
        degree = poly.degree()
    except Exception:
        degree = None
        
    if degree == 1:
        tipo_str = 'Ecuación Algebraica Lineal (Primer Grado)'
        steps.append({
            'num': 2,
            'titulo': 'Clasificación de la Ecuación',
            'descripcion': f'Se clasifica como una {tipo_str}. El exponente máximo de la variable {sym} es 1, por lo que posee una solución única.',
            'tipo': 'clasificacion'
        })
        
        # Agrupación de términos
        terms_lhs = sp.Add.make_args(lhs)
        terms_rhs = sp.Add.make_args(rhs)
        
        var_lhs = sum([t for t in terms_lhs if sym in t.free_symbols])
        const_lhs = sum([t for t in terms_lhs if sym not in t.free_symbols])
        var_rhs = sum([t for t in terms_rhs if sym in t.free_symbols])
        const_rhs = sum([t for t in terms_rhs if sym not in t.free_symbols])
        
        step3_lhs = var_lhs - var_rhs
        step3_rhs = const_rhs - const_lhs
        
        steps.append({
            'num': 3,
            'titulo': 'Trasposición de Términos',
            'descripcion': f'Agrupamos los términos con la incógnita {sym} en el miembro izquierdo y las constantes numéricas en el miembro derecho:\n\n{sp.latex(sp.Eq(step3_lhs, step3_rhs))}',
            'tipo': 'algebra'
        })
        
        coeffs = poly.all_coeffs()
        a_coef = coeffs[0]
        b_const = -coeffs[1]
        
        steps.append({
            'num': 4,
            'titulo': 'Reducción de Términos Semejantes',
            'descripcion': f'Efectuamos las sumas y restas algebraicas en ambos miembros:\n\n{sp.latex(sp.Eq(a_coef * sym, b_const))}',
            'tipo': 'algebra'
        })
        
        sol_val = sol[0] if sol else b_const / a_coef
        steps.append({
            'num': 5,
            'titulo': 'Despeje de la Incógnita y Solución',
            'descripcion': f'Dividimos ambos miembros entre el coeficiente {a_coef} para aislar {sym}:\n\n{sym} = {sp.latex(sol_val)}',
            'tipo': 'particular'
        })
        
        # Comprobación pedagógica
        try:
            lhs_eval = lhs.subs(sym, sol_val)
            rhs_eval = rhs.subs(sym, sol_val)
            steps.append({
                'num': 6,
                'titulo': 'Comprobación Pedagógica de la Igualdad',
                'descripcion': f'Sustituimos {sym} = {sol_val} en la ecuación original:\n• Miembro izquierdo: {sp.latex(lhs)} \\implies {lhs_eval}\n• Miembro derecho: {sp.latex(rhs)} \\implies {rhs_eval}\n\n{lhs_eval} = {rhs_eval} \\quad \\checkmark \\text{{ (Identidad demostrada)}}',
                'tipo': 'general'
            })
        except Exception:
            pass
            
    elif degree == 2:
        tipo_str = 'Ecuación Algebraica Cuadrática (Segundo Grado)'
        coeffs = poly.all_coeffs()
        a, b, c = coeffs[0], coeffs[1], coeffs[2]
        disc = b**2 - 4*a*c
        
        steps.append({
            'num': 2,
            'titulo': 'Clasificación y Forma Canónica',
            'descripcion': f'Se clasifica como una {tipo_str} de la forma ax² + bx + c = 0:\n\n{sp.latex(poly.as_expr())} = 0\n\nIdentificamos sus coeficientes: a = {a}, b = {b}, c = {c}.',
            'tipo': 'clasificacion'
        })
        
        steps.append({
            'num': 3,
            'titulo': 'Cálculo del Discriminante (Δ)',
            'descripcion': f'El discriminante determina la naturaleza de las soluciones mediante Δ = b² - 4ac:\n\n\\Delta = ({b})^2 - 4({a})({c}) = {disc}',
            'tipo': 'algebra'
        })
        
        steps.append({
            'num': 4,
            'titulo': 'Aplicación de la Fórmula General Cuadrática',
            'descripcion': f'Aplicamos la fórmula resolvente cuadrática:\n\n{sym} = \\frac{{-b \\pm \\sqrt{{\\Delta}}}}{{2a}} = \\frac{{-({b}) \\pm \\sqrt{{{disc}}}}}{{2({a})}}',
            'tipo': 'metodo'
        })
        
        sol_str = ', \\; '.join([f'{sym}_{{{i+1}}} = {sp.latex(s)}' for i, s in enumerate(sol)])
        steps.append({
            'num': 5,
            'titulo': 'Soluciones / Raíces de la Ecuación',
            'descripcion': f'Las soluciones obtenidas son:\n\n{sol_str}',
            'tipo': 'particular'
        })
    else:
        steps.append({
            'num': 2,
            'titulo': 'Resolución Algebraica',
            'descripcion': f'Despejamos algebraicamente la incógnita {sym}:\n\n{sp.latex(eq)}',
            'tipo': 'algebra'
        })
        sol_str = ', \\; '.join([f'{sym}_{{{i+1}}} = {sp.latex(s)}' for i, s in enumerate(sol)]) if sol else '\\text{Sin solución real}'
        steps.append({
            'num': 3,
            'titulo': 'Valores que satisfacen la ecuación',
            'descripcion': f'Solución obtenida:\n\n{sol_str}',
            'tipo': 'particular'
        })
        
    return steps

def parse_and_solve_ode(eq_str, x0=0, y0=None, y1=None):
    """
    Parsea una ecuación diferencial en notación matemática estándar o natural
    (soporta dx/dy, dy/dx, y', y'', multiplicación implícita como 2x, 3y, etc.)
    y la resuelve analíticamente con SymPy.
    """
    x = sp.Symbol('x')
    y = sp.Function('y')
    
    clean_str = eq_str.strip()
    clean_str = clean_str.replace('−', '-').replace('–', '-').replace('·', '*').replace('×', '*')
    
    # Superíndices unicode (², ³, etc.) a potencias ^
    unicode_powers = {'⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'}
    for u, digit in unicode_powers.items():
        clean_str = clean_str.replace(u, f'^{digit}')
        
    # Normalizar notaciones de derivada
    clean_str = re.sub(r'd\^?2y\s*/\s*dx\^?2', "y''", clean_str, flags=re.I)
    clean_str = re.sub(r'd\^?2x\s*/\s*dy\^?2', "y''", clean_str, flags=re.I)
    clean_str = re.sub(r'dy\s*/\s*dx', "y'", clean_str, flags=re.I)
    clean_str = re.sub(r'dx\s*/\s*dy', "y'", clean_str, flags=re.I)
    clean_str = re.sub(r'd\s*/\s*dx\s*\(?\s*y\s*\)?', "y'", clean_str, flags=re.I)
    clean_str = re.sub(r'd\s*/\s*dy\s*\(?\s*x\s*\)?', "y'", clean_str, flags=re.I)
    
    # Si no tiene signo igual, interpretar como y' = f(x) o expr = 0
    if '=' in clean_str:
        lhs_str, rhs_str = clean_str.split('=', 1)
    else:
        if "y'" in clean_str or "y''" in clean_str:
            lhs_str, rhs_str = clean_str, '0'
        else:
            lhs_str, rhs_str = "y'", clean_str
        
    def transform_part(s):
        e = s.strip()
        if not e:
            return '0'
            
        # e^(...) o e^x -> exp(...)
        e = re.sub(r'\be\^\(([^)]+)\)', r'exp(\1)', e)
        e = re.sub(r'\be\^([a-zA-Z0-9_]+)', r'exp(\1)', e)
        
        # ln -> log
        e = re.sub(r'\bln\b', 'log', e)
        
        # Proteger derivadas usando tokens alfabéticos puros sin números
        e = e.replace("y''", "DIFFTWO").replace("y'", "DIFFONE")
        
        # Multiplicación implícita:
        # Número seguido de letra (2x -> 2*x, 2y -> 2*y)
        e = re.sub(r'(\d+(?:\.\d+)?)\s*([a-zA-Z])', r'\1*\2', e)
        # Número seguido de paréntesis: 2(x+1) -> 2*(x+1)
        e = re.sub(r'(\d+(?:\.\d+)?)\s*\(', r'\1*(', e)
        # Paréntesis seguido de paréntesis: )( -> )*(
        e = re.sub(r'\)\s*\(', r')*(', e)
        # Paréntesis seguido de letra/número: )x -> )*x
        e = re.sub(r'\)\s*([a-zA-Z0-9])', r')*\1', e)
        
        # Variable x seguida de y: xy -> x*y, x y -> x*y
        e = re.sub(r'\bx\s*y\b', 'x*y', e)
        e = re.sub(r'\by\s*x\b', 'y*x', e)
        
        # x seguido de paréntesis (que no sea función)
        e = re.sub(r'\bx\s*\(', 'x*(', e)
        
        # Variable x seguida de función: x sin(x) -> x*sin(x), x exp(x) -> x*exp(x)
        funcs = ['sin', 'cos', 'tan', 'exp', 'log', 'sqrt']
        for fn in funcs:
            e = re.sub(r'(\bx)\s*(' + fn + r'\b)', r'\1*\2', e)
            
        # Ahora que 2y es 2*y, reemplazamos cualquier y aislada por y(x)
        e = re.sub(r'\by\b(?!\()', 'y(x)', e)
        
        # Restaurar derivadas a sintaxis SymPy
        e = e.replace('DIFFTWO', 'y(x).diff(x, 2)')
        e = e.replace('DIFFONE', 'y(x).diff(x)')
        
        # ^ -> **
        e = e.replace('^', '**')
        return e

    lhs_expr_str = transform_part(lhs_str)
    rhs_expr_str = transform_part(rhs_str)
    
    local_dict = {
        'x': x, 'y': y,
        'exp': sp.exp, 'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan,
        'ln': sp.log, 'log': sp.log, 'e': sp.E, 'pi': sp.pi,
        'sqrt': sp.sqrt
    }
    transformations = standard_transformations + (implicit_multiplication_application, convert_xor)
    
    lhs = sp.nsimplify(parse_expr(lhs_expr_str, local_dict=local_dict, transformations=transformations))
    rhs = sp.nsimplify(parse_expr(rhs_expr_str, local_dict=local_dict, transformations=transformations))
    eq = sp.Eq(lhs, rhs)
    
    # Clasificación y orden de la ecuación
    derivs = [d for d in eq.atoms(sp.Derivative) if d.expr == y(x)]
    if not derivs:
        # ES UNA ECUACIÓN ALGEBRAICA (ej: 5x + 3 = 4x + 6, x^2 - 4 = 0)
        syms = list(eq.free_symbols)
        if x in syms:
            sym = x
        elif y in syms:
            sym = y
        elif syms:
            sym = syms[0]
        else:
            sym = x
            
        sol = sp.solve(eq, sym)
        steps = build_algebraic_steps(eq, sym, sol)
        
        plot_points = []
        try:
            diff_func = eq.lhs - eq.rhs
            center_x = float(sol[0]) if sol and hasattr(sol[0], 'is_real') and sol[0].is_real else 0.0
            f_num = sp.lambdify(sym, diff_func, modules=['numpy', 'math'])
            xs = np.linspace(center_x - 4.0, center_x + 4.0, 100)
            for val_x in xs:
                try:
                    val_y = float(f_num(val_x))
                    if not math.isnan(val_y) and not math.isinf(val_y) and abs(val_y) < 1e5:
                        plot_points.append({"x": round(float(val_x), 3), "y": round(float(val_y), 4)})
                except Exception:
                    continue
        except Exception:
            plot_points = []
            
        if sol:
            if len(sol) == 1:
                sol_str_latex = f"{sym} = {sp.latex(sol[0])}"
            else:
                sol_str_latex = ", \\; ".join([f"{sym}_{{{i+1}}} = {sp.latex(s)}" for i, s in enumerate(sol)])
        else:
            sol_str_latex = "\\text{Sin solución real}"
            
        return {
            "latex_eq": sp.latex(eq),
            "latex_general": sol_str_latex,
            "str_general": str(sol),
            "latex_particular": sol_str_latex,
            "str_particular": sol_str_latex,
            "order": 0,
            "steps": steps,
            "plot_points": plot_points
        }
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
        sol_item = active_sol[0] if isinstance(active_sol, list) and len(active_sol) > 0 else active_sol
        rhs_func = getattr(sol_item, 'rhs', sol_item)
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
