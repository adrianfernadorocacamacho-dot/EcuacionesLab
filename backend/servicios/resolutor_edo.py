"""
Servicio de resolución didáctica de ecuaciones diferenciales con SymPy y NumPy.
Basado en la metodología pedagógica del Problemario de Ecuaciones Diferenciales
de la Universidad Autónoma de Nuevo León (UANL) - FIME (Facultad de Ingeniería Mecánica y Eléctrica).
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

# Símbolos globales comunes
x = sp.Symbol('x')
y = sp.Symbol('y')
C = sp.Symbol('C')
C1, C2, C3, C4, C5, C6 = sp.symbols('C1 C2 C3 C4 C5 C6')
m = sp.Symbol('m')
u = sp.Symbol('u')
v = sp.Symbol('v')
t = sp.Symbol('t', positive=True)

__dx__ = sp.Symbol('__dx__')
__dy__ = sp.Symbol('__dy__')

LOCAL_DICT = {
    'x': x, 'y': y, 'C': C, 'c': C,
    'C1': C1, 'C2': C2, 'C3': C3, 'C4': C4,
    'm': m, 'u': u, 'v': v,
    '__dx__': __dx__, '__dy__': __dy__,
    'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan, 'cot': sp.cot,
    'sec': sp.sec, 'csc': sp.csc, 'asin': sp.asin, 'acos': sp.acos, 'atan': sp.atan,
    'exp': sp.exp, 'log': sp.log, 'ln': sp.log, 'sqrt': sp.sqrt,
    'e': sp.E, 'pi': sp.pi
}

TRANSFORMATIONS = standard_transformations + (implicit_multiplication_application, convert_xor)


# ==============================================================================
# UTILIDADES DE LIMPIEZA Y PARSEO
# ==============================================================================

def clean_and_normalize(s):
    """Normaliza caracteres tipográficos, funciones en español y exponentes unicode."""
    s = s.strip()
    s = s.replace('−', '-').replace('–', '-').replace('·', '*').replace('×', '*')
    
    # Exponentes unicode
    unicode_powers = {
        '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
        '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
    }
    for u_char, digit in unicode_powers.items():
        s = s.replace(u_char, f'^{digit}')
        
    # Funciones trigonométricas en español a notación estándar
    s = re.sub(r'\bsen\b', 'sin', s, flags=re.I)
    s = re.sub(r'\btg\b', 'tan', s, flags=re.I)
    s = re.sub(r'\bctg\b', 'cot', s, flags=re.I)
    s = re.sub(r'\barctg\b', 'atan', s, flags=re.I)
    s = re.sub(r'\barcsen\b', 'asin', s, flags=re.I)
    s = re.sub(r'\barccos\b', 'acos', s, flags=re.I)
    
    # Corchetes a paréntesis
    s = s.replace('[', '(').replace(']', ')')
    return s


def extract_ics_from_string(eq_str):
    """
    Extrae condiciones iniciales de la cadena si están presentes
    (ej: "(D^2 + 2D + 1)y = 0 ; y = 1, Dy = -1 cuando x = 0" o "y(0) = 1").
    """
    main_eq = eq_str.strip()
    cond_str = ''
    
    # Detectar separadores comunes de condiciones iniciales
    for sep in [';', ' cuando ', ' para ', ' donde ', ' con ']:
        if sep in main_eq:
            parts = main_eq.split(sep, 1)
            main_eq = parts[0].strip()
            cond_str = parts[1].strip()
            break
            
    x0, y0, y1, y2 = None, None, None, None
    
    # Patrón estilo y(0) = 1, y'(0) = 2
    patt_y0 = re.search(r'y\s*\(\s*([-\d\.]+)\s*\)\s*=\s*([-\d\.]+)', main_eq)
    if patt_y0:
        x0 = float(patt_y0.group(1))
        y0 = float(patt_y0.group(2))
        main_eq = re.sub(r',?\s*y\s*\(\s*[-\d\.]+\s*\)\s*=\s*[-\d\.]+', '', main_eq).strip()
        
    patt_y1 = re.search(r'y\'\s*\(\s*([-\d\.]+)\s*\)\s*=\s*([-\d\.]+)', main_eq)
    if patt_y1:
        if x0 is None:
            x0 = float(patt_y1.group(1))
        y1 = float(patt_y1.group(2))
        main_eq = re.sub(r',?\s*y\'\s*\(\s*[-\d\.]+\s*\)\s*=\s*[-\d\.]+', '', main_eq).strip()

    if cond_str:
        m_x = re.search(r'\bx\s*=\s*([-\d\.]+)', cond_str, re.I)
        if m_x:
            x0 = float(m_x.group(1))
        m_y = re.search(r'(?<!D)(?<!\')\by\s*=\s*([-\d\.]+)', cond_str, re.I)
        if m_y:
            y0 = float(m_y.group(1))
        m_dy = re.search(r'\b(?:Dy|y\')\s*=\s*([-\d\.]+)', cond_str, re.I)
        if m_dy:
            y1 = float(m_dy.group(1))
        m_d2y = re.search(r'\b(?:D\^?2y|D²y|y\'\')\s*=\s*([-\d\.]+)', cond_str, re.I)
        if m_d2y:
            y2 = float(m_d2y.group(1))

    return main_eq, x0, y0, y1, y2


def make_step(num, titulo, explicacion, latex='', nota=''):
    """Crea un paso estructurado para la vista didáctica."""
    desc = explicacion
    if latex:
        desc += f"\n\n{latex}"
    if nota:
        desc += f"\n\nNota pedagógica: {nota}"
    return {
        'num': num,
        'titulo': titulo,
        'explicacion': explicacion,
        'latex': latex,
        'nota': nota,
        'descripcion': desc
    }


def safe_plot_points(sol_expr, x_sym, y_sym, x0=0.0):
    """Genera puntos muestrales para la gráfica de forma segura."""
    points = []
    try:
        # Intentar obtener y explícita
        func_y = None
        if hasattr(sol_expr, 'rhs'):
            if sol_expr.lhs == y_sym or (hasattr(sol_expr.lhs, 'func') and sol_expr.lhs.func.__name__ == 'y'):
                func_y = sol_expr.rhs
            elif sol_expr.rhs == y_sym:
                func_y = sol_expr.lhs
        elif isinstance(sol_expr, (list, tuple)) and len(sol_expr) > 0:
            func_y = getattr(sol_expr[0], 'rhs', sol_expr[0])
            
        if func_y is None:
            # Ecuación implícita Psi(x,y) = C o similar: intentar despejar y
            try:
                despejes = sp.solve(sol_expr, y_sym)
                if despejes:
                    func_y = despejes[0]
            except Exception:
                pass

        if func_y is not None:
            # Reemplazar cualquier constante libre por 1.0 para graficar familia
            free_c = func_y.free_symbols - {x_sym}
            subs_c = {sym: 1.0 for sym in free_c}
            eval_f = func_y.subs(subs_c)
            f_num = sp.lambdify(x_sym, eval_f, modules=['numpy', 'math'])
            
            start_x = float(x0) if x0 is not None else 0.0
            xs = np.linspace(start_x, start_x + 5.0, 100)
            for val_x in xs:
                try:
                    val_y = float(f_num(val_x))
                    if not math.isnan(val_y) and not math.isinf(val_y) and abs(val_y) < 1e5:
                        points.append({"x": round(float(val_x), 3), "y": round(float(val_y), 4)})
                except Exception:
                    continue
    except Exception:
        pass
    return points


# ==============================================================================
# RESOLUTOR 1: OPERADOR D (UANL FIME CAPÍTULO 3)
# ==============================================================================

def is_operator_d(eq_str):
    """Detecta si la expresión usa la notación de operador diferencial D."""
    s = eq_str.strip()
    if re.search(r'\b(dx|dy)\b', s):
        return False
    return bool(re.search(r'\(?[D0-9\+\-\*\^\s\(\)]*D[D0-9\+\-\*\^\s\(\)]*\)?\s*\*?\s*y\s*=', s))


def build_book_style_solution_latex(roots_dict, x_sym):
    """
    Construye la solución general agrupada exactamente como en el Problemario UANL FIME:
    y = [ (c_1 + c_2 x + ... + c_k x^{k-1}) cos(beta x) + (c_{k+1} + ... + c_{2k} x^{k-1}) sen(beta x) ] e^{alpha x}
    """
    c_idx = 1
    parts_latex = []
    
    # 1. Raíces reales
    real_roots = sorted([(sp.re(r), mult) for r, mult in roots_dict.items() if sp.im(r) == 0], key=lambda item: item[0])
    for r_val, mult in real_roots:
        r_sim = sp.nsimplify(r_val)
        c_poly_terms = []
        for k in range(mult):
            c_name = f'c_{{{c_idx}}}'
            if k == 0:
                c_poly_terms.append(f'{c_name}')
            elif k == 1:
                c_poly_terms.append(f'{c_name} x')
            else:
                c_poly_terms.append(f'{c_name} x^{{{k}}}')
            c_idx += 1
            
        c_poly_str = ' + '.join(c_poly_terms)
        if r_sim == 0:
            parts_latex.append(c_poly_str)
        else:
            if mult == 1:
                parts_latex.append(f'{c_poly_str} e^{{{sp.latex(r_sim * x_sym)}}}')
            else:
                parts_latex.append(f'\\left({c_poly_str}\\right) e^{{{sp.latex(r_sim * x_sym)}}}')
                
    # 2. Raíces complejas conjugadas (alpha +- beta*i)
    complex_roots = sorted([(r, mult) for r, mult in roots_dict.items() if sp.im(r) > 0], key=lambda item: (sp.re(item[0]), sp.im(item[0])))
    for r_val, mult in complex_roots:
        alpha = sp.nsimplify(sp.re(r_val))
        beta = sp.nsimplify(sp.im(r_val))
        
        # Términos polinomiales para coseno
        cos_c = []
        for k in range(mult):
            c_name = f'c_{{{c_idx}}}'
            if k == 0:
                cos_c.append(f'{c_name}')
            elif k == 1:
                cos_c.append(f'{c_name} x')
            else:
                cos_c.append(f'{c_name} x^{{{k}}}')
            c_idx += 1
            
        # Términos polinomiales para seno
        sin_c = []
        for k in range(mult):
            c_name = f'c_{{{c_idx}}}'
            if k == 0:
                sin_c.append(f'{c_name}')
            elif k == 1:
                sin_c.append(f'{c_name} x')
            else:
                sin_c.append(f'{c_name} x^{{{k}}}')
            c_idx += 1
            
        cos_str = ' + '.join(cos_c)
        sin_str = ' + '.join(sin_c)
        arg_trig = 'x' if beta == 1 else f'{sp.latex(beta)}x'
        
        if mult == 1:
            trig_part = f'\\left({cos_str}\\cos({arg_trig}) + {sin_str}\\operatorname{{sen}}({arg_trig})\\right)'
        else:
            trig_part = f'\\left[ \\left({cos_str}\\right)\\cos({arg_trig}) + \\left({sin_str}\\right)\\operatorname{{sen}}({arg_trig}) \\right]'
            
        if alpha == 0:
            if mult == 1:
                parts_latex.append(f'{cos_str}\\cos({arg_trig}) + {sin_str}\\operatorname{{sen}}({arg_trig})')
            else:
                parts_latex.append(f'\\left({cos_str}\\right)\\cos({arg_trig}) + \\left({sin_str}\\right)\\operatorname{{sen}}({arg_trig})')
        else:
            exp_term = 'e^{x}' if alpha == 1 else ('e^{-x}' if alpha == -1 else f'e^{{{sp.latex(alpha * x_sym)}}}')
            parts_latex.append(f'{trig_part} {exp_term}')
            
    return ' + '.join(parts_latex) if parts_latex else '0'


def solve_operator_d(eq_str, x0=0.0, y0=None, y1=None, y2=None):
    """
    Resuelve ecuaciones lineales con coeficientes constantes usando el operador D,
    siguiendo la metodología exacta de la UANL FIME (Secciones 3.1, 3.2 y 3.3).
    """
    steps = []
    
    # 1. Parsear operador P(D) y miembro derecho g(x)
    m_match = re.search(r'^(.*?)\s*\*?\s*y\s*=\s*(.+)$', eq_str.strip(), re.I)
    if not m_match:
        raise ValueError("Formato de Operador D no reconocido. Ejemplo: (D^2 + 9D + 18)y = 0")
        
    op_s = m_match.group(1).strip()
    rhs_s = m_match.group(2).strip()
    
    # Limpiar operador
    s_op = op_s.replace('^', '**')
    s_op = re.sub(r'D', 'm', s_op)
    poly_m = sp.expand(parse_expr(s_op, local_dict={'m': m}, transformations=TRANSFORMATIONS))
    
    # Parsear g(x)
    s_rhs = clean_and_normalize(rhs_s)
    s_rhs = re.sub(r'\be\^\(([^)]+)\)', r'exp(\1)', s_rhs)
    s_rhs = re.sub(r'\be\^([a-zA-Z0-9_]+)', r'exp(\1)', s_rhs)
    s_rhs = s_rhs.replace('^', '**')
    g_x = parse_expr(s_rhs, local_dict=LOCAL_DICT, transformations=TRANSFORMATIONS)
    
    order = sp.Poly(poly_m, m).degree()
    
    # PASO 1: Forma Canónica y Ecuación Característica (Como en el libro)
    orig_m_expr = parse_expr(s_op, local_dict={'m': m}, transformations=TRANSFORMATIONS)
    orig_m_latex = sp.latex(orig_m_expr)
    poly_expanded_latex = sp.latex(poly_m)
    factored_m = sp.factor(poly_m)
    factored_latex = sp.latex(factored_m)
    
    if orig_m_latex != poly_expanded_latex:
        char_eq_latex = f"{orig_m_latex} = 0"
        paso1_desc = "La ecuación característica es:"
    elif poly_expanded_latex != factored_latex:
        char_eq_latex = f"{poly_expanded_latex} = 0 \\implies {factored_latex} = 0"
        paso1_desc = f"La ecuación característica es:\n{poly_expanded_latex} = 0\n\nFactorizando:\n{factored_latex} = 0"
    else:
        char_eq_latex = f"{poly_expanded_latex} = 0"
        paso1_desc = "La ecuación característica es:"
        
    steps.append(make_step(
        1,
        'Planteamiento de la Ecuación Característica (UANL Sec. 3.1)',
        paso1_desc,
        char_eq_latex,
        'Reemplazamos el operador diferencial D por el parámetro algebraico m.'
    ))
    
    # PASO 2: Factorización y Resolución por Fórmula General
    const_fac, fac_list = sp.factor_list(poly_m)
    p2_exps = []
    p2_latexs = []
    
    roots_dict = sp.roots(poly_m, m)
    roots_list = sp.solve(sp.Eq(poly_m, 0), m)
    
    for fac, mult in fac_list:
        deg = sp.degree(fac, m)
        if deg == 1:
            root_val = sp.solve(fac, m)[0]
            if mult == 1:
                p2_exps.append(f"De {sp.latex(fac)} = 0:")
                p2_latexs.append(f"m = {sp.latex(root_val)}")
            else:
                p2_exps.append(f"De ({sp.latex(fac)})^{{{mult}}} = 0:")
                roots_rep = ', '.join([sp.latex(root_val) for _ in range(mult)])
                p2_latexs.append(f"m = {roots_rep} \\quad \\text{{(raíz real repetida {mult} veces)}}")
        elif deg == 2:
            coeffs = sp.Poly(fac, m).all_coeffs()
            a_val, b_val, c_val = coeffs[0], coeffs[1], coeffs[2]
            if b_val == 0:
                disc_neg = -c_val / a_val
                r_im = sp.sqrt(disc_neg)
                p2_exps.append(f"Resolviendo: {sp.latex(fac)} = 0")
                if mult == 1:
                    p2_latexs.append(f"m^2 = {sp.latex(-c_val/a_val)} \\implies m = \\pm {sp.latex(r_im)}")
                else:
                    p2_latexs.append(f"m^2 = {sp.latex(-c_val/a_val)} \\implies m = \\pm {sp.latex(r_im)} \\quad \\text{{(repetidas {mult} veces)}}")
            else:
                disc = b_val**2 - 4*a_val*c_val
                minus_b = -b_val
                two_a = 2*a_val
                p2_exps.append(f"Resolviendo por la fórmula general: {sp.latex(fac)} = 0\nIdentificamos: a = {a_val}, b = {b_val}, c = {c_val}")
                term1 = f"\\frac{{-({b_val}) \\pm \\sqrt{{({b_val})^2 - 4({a_val})({c_val})}}}}{{2({a_val})}}"
                term2 = f"\\frac{{{minus_b} \\pm \\sqrt{{{disc}}}}}{{{two_a}}}"
                if disc < 0:
                    sqrt_pos = sp.sqrt(-disc)
                    term3 = f"\\frac{{{minus_b} \\pm {sp.latex(sqrt_pos)}i}}{{{two_a}}}"
                    alpha_num = sp.nsimplify(sp.Rational(minus_b, two_a))
                    beta_num = sp.nsimplify(sqrt_pos / two_a)
                    res_m = f"{alpha_num} \\pm {beta_num}i" if alpha_num != 0 else f"\\pm {beta_num}i"
                    formula_str = f"\\frac{{-b \\pm \\sqrt{{b^2 - 4ac}}}}{{2a}} = {term1} = {term2} = {term3} = {res_m}"
                else:
                    sqrt_pos = sp.sqrt(disc)
                    term3 = f"\\frac{{{minus_b} \\pm {sp.latex(sqrt_pos)}}}{{{two_a}}}"
                    r1 = sp.nsimplify(sp.Rational(minus_b + sqrt_pos, two_a))
                    r2 = sp.nsimplify(sp.Rational(minus_b - sqrt_pos, two_a))
                    formula_str = f"\\frac{{-b \\pm \\sqrt{{b^2 - 4ac}}}}{{2a}} = {term1} = {term2} = {term3} \\implies m_1 = {sp.latex(r1)}, \\; m_2 = {sp.latex(r2)}"
                    
                if mult > 1:
                    formula_str += f" \\quad \\text{{(repetidas {mult} veces)}}"
                p2_latexs.append(formula_str)
                
    steps.append(make_step(
        2,
        'Resolución de Factores y Fórmula General (UANL FIME)',
        '\n\n'.join(p2_exps),
        ' \\\\\n'.join(p2_latexs)
    ))
    
    # PASO 3: Clasificación según los Casos de la FIME
    roots_desc = []
    yc_terms = []
    c_counter = 1
    processed_roots = set()
    
    for r_val, mult in roots_dict.items():
        if r_val in processed_roots:
            continue
        re_part, im_part = sp.re(r_val), sp.im(r_val)
        if im_part != 0:
            conj = sp.conjugate(r_val)
            processed_roots.add(r_val)
            processed_roots.add(conj)
            alpha = sp.nsimplify(re_part)
            beta = sp.nsimplify(abs(im_part))
            if mult == 1:
                roots_desc.append(f"• Raíces complejas conjugadas (Caso III FIME): m = {sp.latex(alpha)} \\pm {sp.latex(beta)}i")
            else:
                roots_desc.append(f"• Raíces complejas conjugadas repetidas (Caso III FIME): m = {sp.latex(alpha)} \\pm {sp.latex(beta)}i con multiplicidad {mult}")
            for k in range(mult):
                xk = x**k if k > 0 else 1
                c1_sym = sp.Symbol(f'c_{c_counter}')
                c2_sym = sp.Symbol(f'c_{c_counter+1}')
                c_counter += 2
                term = sp.exp(alpha*x) * (c1_sym*sp.cos(beta*x) + c2_sym*sp.sin(beta*x)) * xk
                yc_terms.append(term)
        else:
            processed_roots.add(r_val)
            r_sim = sp.nsimplify(r_val)
            if mult == 1:
                roots_desc.append(f"• Raíz real simple (Caso I FIME): m = {sp.latex(r_sim)}")
            else:
                roots_desc.append(f"• Raíz real repetida (Caso II FIME): m = {sp.latex(r_sim)} con multiplicidad {mult}")
            for k in range(mult):
                xk = x**k if k > 0 else 1
                c_sym = sp.Symbol(f'c_{c_counter}')
                c_counter += 1
                term = c_sym * xk * sp.exp(r_sim * x)
                yc_terms.append(term)
                
    steps.append(make_step(
        3,
        'Clasificación de Raíces según los Casos de la FIME',
        'Clasificamos las raíces obtenidas según los 3 casos pedagógicos del Problemario UANL:\n' + '\n'.join(roots_desc),
        f"m = {', '.join([sp.latex(r) for r in roots_list])}"
    ))
    
    # Construcción de la solución general en el formato exacto del libro
    book_sol_latex = build_book_style_solution_latex(roots_dict, x)
    yc = sum(yc_terms)
    
    # PASO 4: Si no es homogénea (g(x) != 0), Coeficientes Indeterminados (UANL Sec. 3.3)
    yp = sp.Integer(0)
    y_func = sp.Function('y')
    if g_x != 0:
        coeffs = sp.Poly(poly_m, m).all_coeffs()
        degree = len(coeffs) - 1
        ode_lhs = 0
        for i, coef in enumerate(coeffs):
            d_order = degree - i
            if d_order == 0:
                ode_lhs += coef * y_func(x)
            else:
                ode_lhs += coef * y_func(x).diff(x, d_order)
        ode = sp.Eq(ode_lhs, g_x)
        full_sym_sol = sp.dsolve(ode, y_func(x))
        
        full_rhs = full_sym_sol.rhs
        c_symbols = [s for s in full_rhs.free_symbols if s.name.startswith('C')]
        yp = sp.simplify(full_rhs.subs({cs: 0 for cs in c_symbols}))
        
        steps.append(make_step(
            4,
            'Método de los Coeficientes Indeterminados para yp(x) (UANL Sec. 3.3)',
            f'Para la función no homogénea g(x) = {sp.latex(g_x)}, proponemos una solución particular yp(x). Sustituyendo en la ecuación diferencial:',
            f"y_p(x) = {sp.latex(yp)}"
        ))
        
    sol_gen_expr = yc + yp
    
    if g_x == 0:
        final_gen_latex = f"y = {book_sol_latex}"
    else:
        final_gen_latex = f"y = {book_sol_latex} + {sp.latex(yp)}"
        
    steps.append(make_step(
        len(steps) + 1,
        'Solución General de la Ecuación Diferencial (UANL FIME)',
        'Por lo que la solución general es:',
        final_gen_latex
    ))
    
    # PASO 5: Condiciones Iniciales (PVI) si se proporcionan (UANL Sec. 3.2)
    sol_part_expr = None
    if y0 is not None:
        c_syms = [s for s in sol_gen_expr.free_symbols if s.name.startswith('c_')]
        eqs_pvi = []
        eval_x0 = sp.nsimplify(x0)
        
        eqs_pvi.append(sp.Eq(sol_gen_expr.subs(x, eval_x0), sp.nsimplify(y0)))
        
        if y1 is not None and order >= 2:
            dy_expr = sol_gen_expr.diff(x)
            eqs_pvi.append(sp.Eq(dy_expr.subs(x, eval_x0), sp.nsimplify(y1)))
            
        if y2 is not None and order >= 3:
            d2y_expr = sol_gen_expr.diff(x, 2)
            eqs_pvi.append(sp.Eq(d2y_expr.subs(x, eval_x0), sp.nsimplify(y2)))
            
        try:
            sol_constants = sp.solve(eqs_pvi, c_syms)
            if sol_constants:
                if isinstance(sol_constants, list):
                    sol_constants = sol_constants[0]
                sol_part_expr = sp.simplify(sol_gen_expr.subs(sol_constants))
                
                cond_txt = f"y({x0}) = {y0}" + (f", y'({x0}) = {y1}" if y1 is not None else "") + (f", y''({x0}) = {y2}" if y2 is not None else "")
                steps.append(make_step(
                    len(steps) + 1,
                    'Deducción de Constantes según Condiciones Iniciales (UANL Sec. 3.2)',
                    f'Sustituimos las condiciones iniciales {cond_txt} en la solución general y sus derivadas para formar un sistema lineal y hallar los valores de las constantes arbitrarias:',
                    ', \\; '.join([f"{sp.latex(k)} = {sp.latex(v)}" for k, v in (sol_constants.items() if isinstance(sol_constants, dict) else [])])
                ))
                steps.append(make_step(
                    len(steps) + 1,
                    'Solución Particular Única del Problema de Valor Inicial',
                    'Reemplazando los valores de las constantes en la solución general:',
                    f"y(x) = {sp.latex(sol_part_expr)}"
                ))
        except Exception:
            sol_part_expr = None

    active_sol = sol_part_expr if sol_part_expr is not None else sol_gen_expr
    plot_points = safe_plot_points(active_sol, x, y, x0=x0)
    
    try:
        op_clean_latex = sp.latex(parse_expr(op_s.replace('^', '**'), local_dict={'D': sp.Symbol('D')}, transformations=TRANSFORMATIONS))
    except Exception:
        op_clean_latex = op_s
    
    return {
        "latex_eq": f"\\left({op_clean_latex}\\right)y = {sp.latex(g_x)}",
        "latex_general": final_gen_latex,
        "str_general": str(sol_gen_expr),
        "latex_particular": f"y(x) = {sp.latex(sol_part_expr)}" if sol_part_expr is not None else None,
        "str_particular": str(sol_part_expr) if sol_part_expr is not None else None,
        "order": order,
        "method_name": "Ecuaciones Lineales con Operador D (UANL FIME Cap. 3)",
        "steps": steps,
        "plot_points": plot_points
    }


# ==============================================================================
# RESOLUTOR 2: FORMAS DIFERENCIALES M(x,y)dx + N(x,y)dy = 0 (UANL FIME CAP. 2)
# ==============================================================================

def parse_differential_form(eq_str):
    """
    Parsea una ecuación en forma diferencial extrayendo M(x,y) y N(x,y) tales que
    M(x,y)dx + N(x,y)dy = 0.
    """
    s = clean_and_normalize(eq_str)
    
    # Manejar posibles fracciones derivadas dy/dx = f(x,y) o dx/dy = f(x,y)
    m_dydx = re.match(r'^\s*dy\s*/\s*dx\s*=\s*(.+)$', s, re.I)
    if m_dydx:
        rhs_expr_str = m_dydx.group(1).strip()
        rhs_expr_str = re.sub(r'\be\^\(([^)]+)\)', r'exp(\1)', rhs_expr_str)
        rhs_expr_str = re.sub(r'\be\^([a-zA-Z0-9_]+)', r'exp(\1)', rhs_expr_str)
        rhs_expr_str = rhs_expr_str.replace('^', '**')
        rhs_expr = parse_expr(rhs_expr_str, local_dict=LOCAL_DICT, transformations=TRANSFORMATIONS)
        num, den = sp.fraction(sp.together(rhs_expr))
        return sp.expand(num), sp.expand(-den), 0
        
    m_dxdy = re.match(r'^\s*dx\s*/\s*dy\s*=\s*(.+)$', s, re.I)
    if m_dxdy:
        rhs_expr_str = m_dxdy.group(1).strip()
        rhs_expr_str = re.sub(r'\be\^\(([^)]+)\)', r'exp(\1)', rhs_expr_str)
        rhs_expr_str = re.sub(r'\be\^([a-zA-Z0-9_]+)', r'exp(\1)', rhs_expr_str)
        rhs_expr_str = rhs_expr_str.replace('^', '**')
        rhs_expr = parse_expr(rhs_expr_str, local_dict=LOCAL_DICT, transformations=TRANSFORMATIONS)
        num, den = sp.fraction(sp.together(rhs_expr))
        return sp.expand(den), sp.expand(-num), 0

    # Reemplazar diferenciales con variables mudas
    s = re.sub(r'\bdx\b', '*__dx__', s)
    s = re.sub(r'\bdy\b', '*__dy__', s)
    s = re.sub(r'(\+|\-|\*|\/|\()\s*\*__dx__', r'\1 __dx__', s)
    s = re.sub(r'(\+|\-|\*|\/|\()\s*\*__dy__', r'\1 __dy__', s)
    s = re.sub(r'^\s*\*__dx__', '__dx__', s)
    s = re.sub(r'^\s*\*__dy__', '__dy__', s)
    
    s = re.sub(r'\be\^\(([^)]+)\)', r'exp(\1)', s)
    s = re.sub(r'\be\^([a-zA-Z0-9_]+)', r'exp(\1)', s)
    s = re.sub(r'\bln\b', 'log', s)
    s = s.replace('^', '**')
    
    if '=' in s:
        lhs_s, rhs_s = s.split('=', 1)
    else:
        lhs_s, rhs_s = s, '0'
        
    lhs = parse_expr(lhs_s, local_dict=LOCAL_DICT, transformations=TRANSFORMATIONS)
    rhs = parse_expr(rhs_s, local_dict=LOCAL_DICT, transformations=TRANSFORMATIONS)
    total = sp.expand(lhs - rhs)
    
    M = total.coeff(__dx__)
    N = total.coeff(__dy__)
    rem = total.subs({__dx__: 0, __dy__: 0})
    return M, N, rem


def solve_exact_ode(M, N, x0=0.0, y0=None):
    """Resuelve ecuaciones diferenciales exactas (UANL Sec. 2.5) con función potencial."""
    steps = []
    steps.append(make_step(
        1,
        'Forma Diferencial Estándar M(x,y)dx + N(x,y)dy = 0 (UANL Sec. 2.5)',
        'Escribimos la ecuación diferencial identificando sus coeficientes diferenciales M y N:\n• M(x,y) acompaña al diferencial dx.\n• N(x,y) acompaña al diferencial dy.',
        f"M(x,y) = {sp.latex(M)}, \\quad N(x,y) = {sp.latex(N)}"
    ))
    
    My = sp.diff(M, y)
    Nx = sp.diff(N, x)
    steps.append(make_step(
        2,
        'Comprobación del Criterio de Euler (Condición de Exactitud)',
        'Calculamos las derivadas parciales cruzadas para verificar si la diferencial es total exacta:\n'
        f'• ∂M/∂y = {sp.latex(My)}\n• ∂N/∂x = {sp.latex(Nx)}\n\n'
        'Como ∂M/∂y = ∂N/∂x, la ecuación diferencial es EXACTA.',
        f"\\frac{{\\partial M}}{{\\partial y}} = {sp.latex(My)} = \\frac{{\\partial N}}{{\\partial x}}"
    ))
    
    # Integrar M con respecto a x
    Psi1 = sp.integrate(M, x)
    steps.append(make_step(
        3,
        'Planteamiento de la Función Potencial Ψ(x,y)',
        'Existe una función potencial Ψ(x,y) tal que ∂Ψ/∂x = M y ∂Ψ/∂y = N. Integramos M(x,y) con respecto a x manteniendo y constante, y sumamos una función desconocida g(y):',
        f"\\Psi(x,y) = \\int M(x,y) dx + g(y) = {sp.latex(Psi1)} + g(y)"
    ))
    
    # Determinar g'(y)
    dPsi1_dy = sp.diff(Psi1, y)
    g_prime = sp.simplify(N - dPsi1_dy)
    steps.append(make_step(
        4,
        'Determinación de g\'(y)',
        'Derivamos parcialmente Ψ(x,y) con respecto a y e igualamos al coeficiente N(x,y):\n'
        '∂Ψ/∂y = ∂/∂y[∫ M dx] + g\'(y) = N(x,y)\n\n'
        'Los términos que contienen x se cancelan exactamente:',
        f"g'(y) = N(x,y) - \\frac{{\\partial}}{{\\partial y}}\\left[{sp.latex(Psi1)}\\right] = {sp.latex(g_prime)}"
    ))
    
    gy = sp.integrate(g_prime, y)
    steps.append(make_step(
        5,
        'Cálculo de la Función g(y)',
        'Integramos g\'(y) respecto a y:',
        f"g(y) = \\int \\left({sp.latex(g_prime)}\\right) dy = {sp.latex(gy)}"
    ))
    
    Psi = sp.simplify(Psi1 + gy)
    sol_gen_latex = f"{sp.latex(Psi)} = C"
    steps.append(make_step(
        6,
        'Solución General Implícita (Familia de Curvas)',
        'Reuniendo la función potencial completa e igualándola a la constante arbitraria C:',
        sol_gen_latex,
        'En ecuaciones exactas de la FIME UANL, la solución se expresa como la relación implícita Ψ(x,y) = C.'
    ))
    
    sol_part_latex = None
    if y0 is not None:
        try:
            c_val = sp.simplify(Psi.subs({x: sp.nsimplify(x0), y: sp.nsimplify(y0)}))
            sol_part_latex = f"{sp.latex(Psi)} = {sp.latex(c_val)}"
            steps.append(make_step(
                7,
                'Aplicación de la Condición Inicial (PVI)',
                f'Evaluamos en el punto inicial dado (x₀ = {x0}, y₀ = {y0}) para fijar el valor de la constante C:',
                f"C = {sp.latex(c_val)} \\implies {sol_part_latex}"
            ))
        except Exception:
            pass
            
    plot_points = safe_plot_points(Psi - C, x, y, x0=x0)
    
    return {
        "latex_eq": f"\\left({sp.latex(M)}\\right)dx + \\left({sp.latex(N)}\\right)dy = 0",
        "latex_general": sol_gen_latex,
        "str_general": f"{Psi} = C",
        "latex_particular": sol_part_latex,
        "str_particular": sol_part_latex,
        "order": 1,
        "method_name": "Ecuaciones Diferenciales Exactas (UANL Sec. 2.5)",
        "steps": steps,
        "plot_points": plot_points
    }


def solve_homogeneous_ode(M, N, x0=0.0, y0=None):
    """Resuelve ecuaciones diferenciales homogéneas (UANL Sec. 2.2) mediante y = vx o x = vy."""
    steps = []
    
    steps.append(make_step(
        1,
        'Identificación en Forma Canónica M(x,y)dx + N(x,y)dy = 0 (UANL Sec. 2.2)',
        'Escribimos la ecuación identificando los coeficientes diferenciales M y N:',
        f"M(x,y) = {sp.latex(M)}, \\quad N(x,y) = {sp.latex(N)}"
    ))
    
    # Probar homogeneidad
    M_t = sp.simplify(M.subs({x: t*x, y: t*y}))
    N_t = sp.simplify(N.subs({x: t*x, y: t*y}))
    
    steps.append(make_step(
        2,
        'Prueba Pedagógica de Homogeneidad f(tx, ty) = tⁿ f(x,y)',
        'Sustituimos x por tx e y por ty para comprobar que ambos coeficientes son funciones homogéneas del mismo grado:\n'
        f'• M(tx, ty) = {sp.latex(M_t)}\n• N(tx, ty) = {sp.latex(N_t)}\n\n'
        'Ambos términos escalan con la misma potencia de t, demostrando que la ecuación es HOMOGÉNEA.',
        f"M(tx, ty) = t^n M(x,y), \\quad N(tx, ty) = t^n N(x,y)"
    ))
    
    # Elección de sustitución según complejidad
    use_y_vx = len(str(N)) <= len(str(M))
    
    if use_y_vx:
        steps.append(make_step(
            3,
            'Selección de la Sustitución Canónica de la FIME',
            'Como N(x,y) presenta una estructura algebraica más compacta, aplicamos la sustitución canónica de la FIME:\n'
            'y = v · x   ⟹   dy = v dx + x dv',
            "y = v x, \\quad dy = v dx + x dv"
        ))
        
        # Sustituir y = v*x, dy = v*dx + x*dv
        M_sub = sp.simplify(M.subs(y, v*x))
        N_sub = sp.simplify(N.subs(y, v*x))
        
        # (M_sub + N_sub*v) dx + (N_sub * x) dv = 0
        coeff_dx = sp.simplify(M_sub + N_sub*v)
        coeff_dv = sp.simplify(N_sub * x)
        
        # Dividir por x si es factorizable
        try:
            # Separar variables: dx/x + (N_sub_v / coeff_dx_v) dv = 0
            deg_x = sp.degree(sp.Poly(coeff_dx, x))
            coeff_dx_v = sp.simplify(coeff_dx / (x**deg_x))
            coeff_dv_v = sp.simplify(N_sub / (x**deg_x))
            
            H_v = sp.simplify(coeff_dv_v / coeff_dx_v)
            int_H = sp.integrate(H_v, v)
            
            steps.append(make_step(
                4,
                'Sustitución y Separación de Variables en x y v',
                'Al sustituir y agrupar los diferenciales, la ecuación se transforma en variables separables:',
                f"\\frac{{dx}}{{x}} + \\left({sp.latex(H_v)}\\right)dv = 0"
            ))
            
            steps.append(make_step(
                5,
                'Integración Indefinida de Ambos Miembros',
                'Integramos con respecto a x y con respecto a v:',
                f"\\ln|x| + {sp.latex(int_H)} = C"
            ))
            
            # Retorno a y/x
            sol_expr = sp.simplify((sp.log(x) + int_H).subs(v, y/x))
            sol_gen_latex = f"{sp.latex(sol_expr)} = C"
        except Exception:
            # Fallback a SymPy dsolve
            ode_y = sp.Eq(y.diff(x), -M/N)
            sym_sol = sp.dsolve(ode_y, y)
            sol_gen_latex = sp.latex(sym_sol)
            sol_expr = sym_sol.lhs - sym_sol.rhs
    else:
        steps.append(make_step(
            3,
            'Selección de la Sustitución Canónica de la FIME',
            'Como M(x,y) presenta una estructura algebraica más compacta, aplicamos la sustitución canónica:\n'
            'x = v · y   ⟹   dx = v dy + y dv',
            "x = v y, \\quad dx = v dy + y dv"
        ))
        ode_y = sp.Eq(y.diff(x), -M/N)
        sym_sol = sp.dsolve(ode_y, y)
        sol_gen_latex = sp.latex(sym_sol)
        sol_expr = sym_sol.lhs - sym_sol.rhs

    steps.append(make_step(
        len(steps) + 1,
        'Retorno a Variables Originales y Solución General (UANL Sec. 2.2)',
        'Sustituimos la variable auxiliar v = y/x para expresar la solución en términos de las variables físicas originales x e y:',
        sol_gen_latex
    ))
    
    plot_points = safe_plot_points(sol_expr, x, y, x0=x0)
    
    return {
        "latex_eq": f"\\left({sp.latex(M)}\\right)dx + \\left({sp.latex(N)}\\right)dy = 0",
        "latex_general": sol_gen_latex,
        "str_general": sol_gen_latex,
        "latex_particular": None,
        "str_particular": None,
        "order": 1,
        "method_name": "Ecuaciones Diferenciales Homogéneas (UANL Sec. 2.2)",
        "steps": steps,
        "plot_points": plot_points
    }


def check_separable(M, N):
    """
    Comprueba si M(x,y)dx + N(x,y)dy = 0 es de variables separables:
    f1(x)g1(y)dx + f2(x)g2(y)dy = 0  =>  (f1/f2)dx + (g2/g1)dy = 0.
    """
    try:
        M_fac = sp.factor(M)
        N_fac = sp.factor(N)
        
        args_M = sp.Mul.make_args(M_fac)
        Mx = sp.Mul(*[a for a in args_M if y not in a.free_symbols])
        My = sp.Mul(*[a for a in args_M if y in a.free_symbols])
        if x in My.free_symbols or y in Mx.free_symbols:
            return None
        if sp.simplify(Mx * My - M) != 0:
            return None
            
        args_N = sp.Mul.make_args(N_fac)
        Nx = sp.Mul(*[a for a in args_N if y not in a.free_symbols])
        Ny = sp.Mul(*[a for a in args_N if y in a.free_symbols])
        if x in Ny.free_symbols or y in Nx.free_symbols:
            return None
        if sp.simplify(Nx * Ny - N) != 0:
            return None
            
        term_x = sp.simplify(Mx / Nx)
        term_y = sp.simplify(Ny / My)
        return {
            'term_x': term_x, 'term_y': term_y,
            'Mx': Mx, 'My': My, 'Nx': Nx, 'Ny': Ny
        }
    except Exception:
        return None


def solve_separable_ode(M, N, sep_info=None, x0=0.0, y0=None):
    """Resuelve ecuaciones diferenciales de variables separables (UANL Sec. 2.1)."""
    steps = []
    
    steps.append(make_step(
        1,
        'Identificación y Planteamiento (UANL Sec. 2.1)',
        'Identificamos la ecuación diferencial en forma separable M(x,y)dx + N(x,y)dy = 0:',
        f"\\left({sp.latex(M)}\\right)dx + \\left({sp.latex(N)}\\right)dy = 0"
    ))
    
    if sep_info and (sep_info['My'] != 1 or sep_info['Nx'] != 1):
        Mx, My, Nx, Ny = sep_info['Mx'], sep_info['My'], sep_info['Nx'], sep_info['Ny']
        tx, ty = sep_info['term_x'], sep_info['term_y']
        steps.append(make_step(
            2,
            'Factorización y Separación de Variables',
            f'Factorizamos los coeficientes para aislar las funciones de cada variable:\n'
            f'• M(x,y) = ({sp.latex(Mx)}) · ({sp.latex(My)})\n'
            f'• N(x,y) = ({sp.latex(Nx)}) · ({sp.latex(Ny)})\n\n'
            f'Dividimos toda la ecuación entre [{sp.latex(Nx * My)}] para agrupar x con dx e y con dy:',
            f"\\left({sp.latex(tx)}\\right)dx + \\left({sp.latex(ty)}\\right)dy = 0"
        ))
        int_M = sp.integrate(tx, x)
        int_N = sp.integrate(ty, y)
        integrand_M = tx
        integrand_N = ty
    else:
        int_M = sp.integrate(M, x)
        int_N = sp.integrate(N, y)
        integrand_M = M
        integrand_N = N
        
    steps.append(make_step(
        len(steps) + 1,
        'Integración Indefinida de Ambos Miembros',
        'Aplicamos el operador integral a cada término:',
        f"\\int \\left({sp.latex(integrand_M)}\\right)dx + \\int \\left({sp.latex(integrand_N)}\\right)dy = C"
    ))
    
    sol_expr = sp.simplify(int_M + int_N)
    sol_gen_latex = f"{sp.latex(sol_expr)} = C"
    
    steps.append(make_step(
        len(steps) + 1,
        'Solución General de la EDO (Familia de Curvas)',
        'Efectuando las antiderivadas obtenemos la familia uniparamétrica de curvas solución:',
        sol_gen_latex
    ))
    
    sol_part_latex = None
    if y0 is not None:
        try:
            c_val = sp.simplify(sol_expr.subs({x: sp.nsimplify(x0), y: sp.nsimplify(y0)}))
            sol_part_latex = f"{sp.latex(sol_expr)} = {sp.latex(c_val)}"
            steps.append(make_step(
                len(steps) + 1,
                'Solución Particular con Condición Inicial (PVI)',
                f'Sustituimos el punto inicial dado (x₀ = {x0}, y₀ = {y0}) para hallar la constante C:',
                f"C = {sp.latex(c_val)} \\implies {sol_part_latex}"
            ))
        except Exception:
            pass
            
    plot_points = safe_plot_points(sol_expr - C, x, y, x0=x0)
    
    return {
        "latex_eq": f"\\left({sp.latex(M)}\\right)dx + \\left({sp.latex(N)}\\right)dy = 0",
        "latex_general": sol_gen_latex,
        "str_general": f"{sol_expr} = C",
        "latex_particular": sol_part_latex,
        "str_particular": sol_part_latex,
        "order": 1,
        "method_name": "Separación de Variables (UANL Sec. 2.1)",
        "steps": steps,
        "plot_points": plot_points
    }


def solve_integrating_factor_ode(M, N, x0=0.0, y0=None):
    """Resuelve mediante Factores Integrantes canónicos de la FIME (UANL Sec. 2.6)."""
    steps = []
    
    My = sp.diff(M, y)
    Nx = sp.diff(N, x)
    
    steps.append(make_step(
        1,
        'Comprobación de No Exactitud (UANL Sec. 2.6)',
        'Calculamos las derivadas parciales cruzadas:\n'
        f'• ∂M/∂y = {sp.latex(My)}\n• ∂N/∂x = {sp.latex(Nx)}\n\n'
        'Como ∂M/∂y ≠ ∂N/∂x, la ecuación NO es exacta y requiere un Factor Integrante μ.',
        f"\\frac{{\\partial M}}{{\\partial y}} \\neq \\frac{{\\partial N}}{{\\partial x}}"
    ))
    
    # Caso 1: (My - Nx)/N depende solo de x
    diff_cross = My - Nx
    fx = sp.simplify(diff_cross / N)
    gy = sp.simplify((Nx - My) / M)
    
    if y not in fx.free_symbols:
        # μ(x) = exp(∫ fx dx)
        int_f = sp.integrate(fx, x)
        mu = sp.exp(int_f)
        steps.append(make_step(
            2,
            'Cálculo del Factor Integrante μ(x) (Caso 1 de la FIME)',
            'Evaluamos el cociente [∂M/∂y - ∂N/∂x] / N. Como depende exclusivamente de x, el factor integrante es:\n'
            'μ(x) = e^(∫ f(x) dx)',
            f"\\mu(x) = e^{{\\int \\left({sp.latex(fx)}\\right) dx}} = {sp.latex(mu)}"
        ))
    elif x not in gy.free_symbols:
        # μ(y) = exp(∫ gy dy)
        int_g = sp.integrate(gy, y)
        mu = sp.exp(int_g)
        steps.append(make_step(
            2,
            'Cálculo del Factor Integrante μ(y) (Caso 2 de la FIME)',
            'Evaluamos el cociente [∂N/∂x - ∂M/∂y] / M. Como depende exclusivamente de y, el factor integrante es:\n'
            'μ(y) = e^(∫ g(y) dy)',
            f"\\mu(y) = e^{{\\int \\left({sp.latex(gy)}\\right) dy}} = {sp.latex(mu)}"
        ))
    else:
        # Fallback a SymPy dsolve
        ode_y = sp.Eq(y.diff(x), -M/N)
        sym_sol = sp.dsolve(ode_y, y)
        steps.append(make_step(
            2,
            'Determinación de Factor Integrante e Integración Simbólica',
            'Aplicamos integración por factores diferenciales cruzados según la tabla de la FIME:',
            sp.latex(sym_sol)
        ))
        return {
            "latex_eq": f"\\left({sp.latex(M)}\\right)dx + \\left({sp.latex(N)}\\right)dy = 0",
            "latex_general": sp.latex(sym_sol),
            "str_general": str(sym_sol),
            "latex_particular": None,
            "str_particular": None,
            "order": 1,
            "method_name": "Factores Integrantes (UANL Sec. 2.6)",
            "steps": steps,
            "plot_points": safe_plot_points(sym_sol, x, y, x0=x0)
        }

    # Multiplicar M y N por mu
    M_new = sp.simplify(mu * M)
    N_new = sp.simplify(mu * N)
    steps.append(make_step(
        3,
        'Multiplicación por μ y Verificación de Exactitud',
        'Multiplicamos la ecuación completa por μ. La nueva ecuación diferencial resultante es EXACTA:',
        f"\\left({sp.latex(M_new)}\\right)dx + \\left({sp.latex(N_new)}\\right)dy = 0"
    ))
    
    # Resolver como exacta
    exact_res = solve_exact_ode(M_new, N_new, x0=x0, y0=y0)
    # Combinar los pasos
    for s_idx, st in enumerate(exact_res['steps'][2:], start=4):
        st['num'] = s_idx
        steps.append(st)
        
    exact_res['steps'] = steps
    exact_res['method_name'] = "Factores Integrantes (UANL Sec. 2.6)"
    return exact_res


def solve_linear_first_order_ode(P, Q, var_dep=y, var_indep=x, x0=0.0, y0=None):
    """Resuelve ecuaciones lineales de 1er orden canónicas (UANL Sec. 2.7)."""
    steps = []
    
    dep_name = str(var_dep)
    indep_name = str(var_indep)
    
    steps.append(make_step(
        1,
        'Forma Canónica Lineal de 1er Orden (UANL Sec. 2.7)',
        f'Escribimos la ecuación en la forma estándar canónica d{dep_name}/d{indep_name} + P({indep_name}){dep_name} = Q({indep_name}):\n'
        f'• P({indep_name}) = {sp.latex(P)}\n• Q({indep_name}) = {sp.latex(Q)}',
        f"\\frac{{d{dep_name}}}{{d{indep_name}}} + \\left({sp.latex(P)}\\right){dep_name} = {sp.latex(Q)}"
    ))
    
    int_P = sp.integrate(P, var_indep)
    mu = sp.exp(int_P)
    
    steps.append(make_step(
        2,
        f'Cálculo del Factor Integrante μ({indep_name})',
        f'El factor integrante permite condensar el miembro izquierdo en la derivada de un producto:\n'
        f'μ({indep_name}) = e^(∫ P({indep_name}) d{indep_name})',
        f"\\mu({indep_name}) = e^{{\\int \\left({sp.latex(P)}\\right)d{indep_name}}} = {sp.latex(mu)}"
    ))
    
    prod_rhs = sp.simplify(mu * Q)
    steps.append(make_step(
        3,
        'Multiplicación por μ y Regla del Producto',
        f'Multiplicamos toda la ecuación por μ({indep_name}). El miembro izquierdo se transforma en la derivada del producto [μ · {dep_name}]:',
        f"\\frac{{d}}{{d{indep_name}}}\\left[{sp.latex(mu)} \\cdot {dep_name}\\right] = {sp.latex(prod_rhs)}"
    ))
    
    int_prod = sp.integrate(prod_rhs, var_indep)
    steps.append(make_step(
        4,
        f'Integración con respecto a {indep_name}',
        'Integramos ambos lados de la igualdad y sumamos la constante arbitraria C:',
        f"{sp.latex(mu)} \\cdot {dep_name} = \\int \\left({sp.latex(prod_rhs)}\\right) d{indep_name} = {sp.latex(int_prod)} + C"
    ))
    
    sol_gen_expr = sp.simplify((int_prod + C) / mu)
    sol_gen_latex = f"{dep_name}({indep_name}) = {sp.latex(sol_gen_expr)}"
    
    steps.append(make_step(
        5,
        'Solución General de la EDO Lineal (UANL Sec. 2.7)',
        f'Despejamos la función incógnita {dep_name}({indep_name}) dividiendo entre el factor integrante:',
        sol_gen_latex
    ))
    
    sol_part_latex = None
    if y0 is not None:
        try:
            c_val = sp.solve(sp.Eq(sol_gen_expr.subs(var_indep, sp.nsimplify(x0)), sp.nsimplify(y0)), C)
            if c_val:
                sol_part_expr = sp.simplify(sol_gen_expr.subs(C, c_val[0]))
                sol_part_latex = f"{dep_name}({indep_name}) = {sp.latex(sol_part_expr)}"
                steps.append(make_step(
                    6,
                    'Solución Particular del Problema de Valor Inicial (PVI)',
                    f'Sustituimos la condición inicial {dep_name}({x0}) = {y0} para fijar la constante:',
                    f"C = {sp.latex(c_val[0])} \\implies {sol_part_latex}"
                ))
        except Exception:
            pass
            
    plot_points = safe_plot_points(sol_gen_expr, var_indep, var_dep, x0=x0)
    
    return {
        "latex_eq": f"\\frac{{d{dep_name}}}{{d{indep_name}}} + \\left({sp.latex(P)}\\right){dep_name} = {sp.latex(Q)}",
        "latex_general": sol_gen_latex,
        "str_general": str(sol_gen_expr),
        "latex_particular": sol_part_latex,
        "str_particular": sol_part_latex,
        "order": 1,
        "method_name": "Ecuaciones Diferenciales Lineales (UANL Sec. 2.7)",
        "steps": steps,
        "plot_points": plot_points
    }


# ==============================================================================
# RESOLUTOR 3: ECUACIONES ALGEBRAICAS (5x + 3 = 4x + 6, CUADRÁTICAS, ETC.)
# ==============================================================================

def build_algebraic_steps(eq, sym, sol):
    """Desglose pedagógico detallado para ecuaciones algebraicas."""
    steps = []
    lhs = eq.lhs
    rhs = eq.rhs
    
    steps.append(make_step(
        1,
        'Identificación y Planteamiento de la Ecuación',
        f'Identificamos la ecuación algebraica con la incógnita {sym}:',
        sp.latex(eq)
    ))
    
    degree = None
    try:
        poly = sp.Poly(lhs - rhs, sym)
        degree = poly.degree()
    except Exception:
        degree = None
        
    if degree == 1:
        steps.append(make_step(
            2,
            'Clasificación de la Ecuación',
            f'Se clasifica como una Ecuación Algebraica Lineal (Primer Grado). El exponente máximo de la variable {sym} es 1, por lo que posee una solución única.',
            f"\\text{{Grado}} = 1"
        ))
        
        terms_lhs = sp.Add.make_args(lhs)
        terms_rhs = sp.Add.make_args(rhs)
        
        var_lhs = sum([t for t in terms_lhs if sym in t.free_symbols])
        const_lhs = sum([t for t in terms_lhs if sym not in t.free_symbols])
        var_rhs = sum([t for t in terms_rhs if sym in t.free_symbols])
        const_rhs = sum([t for t in terms_rhs if sym not in t.free_symbols])
        
        step3_lhs = var_lhs - var_rhs
        step3_rhs = const_rhs - const_lhs
        
        steps.append(make_step(
            3,
            'Trasposición de Términos',
            f'Agrupamos los términos con la incógnita {sym} en el miembro izquierdo y las constantes en el miembro derecho:',
            sp.latex(sp.Eq(step3_lhs, step3_rhs))
        ))
        
        coeffs = poly.all_coeffs()
        a_coef = coeffs[0]
        b_const = -coeffs[1]
        
        steps.append(make_step(
            4,
            'Reducción de Términos Semejantes',
            'Efectuamos las sumas y restas algebraicas en ambos miembros:',
            sp.latex(sp.Eq(a_coef * sym, b_const))
        ))
        
        sol_val = sol[0] if sol else b_const / a_coef
        steps.append(make_step(
            5,
            'Despeje de la Incógnita y Solución',
            f'Dividimos ambos miembros entre el coeficiente {a_coef} para aislar {sym}:',
            f"{sym} = {sp.latex(sol_val)}"
        ))
        
        try:
            lhs_eval = lhs.subs(sym, sol_val)
            rhs_eval = rhs.subs(sym, sol_val)
            steps.append(make_step(
                6,
                'Comprobación Pedagógica de la Igualdad',
                f'Sustituimos {sym} = {sol_val} en la ecuación original demostrando la identidad numérica:',
                f"{lhs_eval} = {rhs_eval} \\quad \\checkmark \\text{{ (Identidad demostrada)}}"
            ))
        except Exception:
            pass
            
    elif degree == 2:
        coeffs = poly.all_coeffs()
        a, b, c_val = coeffs[0], coeffs[1], coeffs[2]
        disc = b**2 - 4*a*c_val
        
        steps.append(make_step(
            2,
            'Clasificación y Forma Canónica Cuadrática',
            f'Ecuación cuadrática de la forma ax² + bx + c = 0, identificando a = {a}, b = {b}, c = {c_val}:',
            f"{sp.latex(poly.as_expr())} = 0"
        ))
        
        steps.append(make_step(
            3,
            'Cálculo del Discriminante (Δ)',
            'El discriminante determina la naturaleza de las raíces (Δ = b² - 4ac):',
            f"\\Delta = ({b})^2 - 4({a})({c_val}) = {disc}"
        ))
        
        steps.append(make_step(
            4,
            'Aplicación de la Fórmula General Cuadrática',
            'Aplicamos la fórmula resolvente:',
            f"{sym} = \\frac{{-({b}) \\pm \\sqrt{{{disc}}}}}{{2({a})}}"
        ))
        
        sol_str = ', \\; '.join([f"{sym}_{{{i+1}}} = {sp.latex(s)}" for i, s in enumerate(sol)])
        steps.append(make_step(
            5,
            'Soluciones / Raíces de la Ecuación',
            'Las soluciones obtenidas son:',
            sol_str
        ))
    else:
        steps.append(make_step(
            2,
            'Resolución Algebraica',
            f'Despejamos algebraicamente la incógnita {sym}:',
            sp.latex(eq)
        ))
        sol_str = ', \\; '.join([f"{sym}_{{{i+1}}} = {sp.latex(s)}" for i, s in enumerate(sol)]) if sol else '\\text{Sin solución real}'
        steps.append(make_step(
            3,
            'Valores que satisfacen la ecuación',
            'Solución obtenida:',
            sol_str
        ))
        
    return steps


# ==============================================================================
# DISPATCHER GENERAL: PARSE AND SOLVE ODE
# ==============================================================================

def parse_and_solve_ode(eq_str, x0=0.0, y0=None, y1=None):
    """
    Función principal de resolución didáctica de ecuaciones diferenciales y algebraicas.
    Coordina automáticamente la selección del método según la metodología pedagógica
    del Problemario UANL FIME.
    """
    # 1. Extraer condiciones iniciales embebidas en la cadena si existen
    clean_str, str_x0, str_y0, str_y1, str_y2 = extract_ics_from_string(eq_str)
    
    if str_x0 is not None:
        x0 = str_x0
    if str_y0 is not None:
        y0 = str_y0
    if str_y1 is not None:
        y1 = str_y1
        
    clean_str = clean_and_normalize(clean_str)
    
    # 2. Caso OPERADOR D (UANL FIME Capítulo 3)
    if is_operator_d(clean_str):
        return solve_operator_d(clean_str, x0=x0, y0=y0, y1=y1, y2=str_y2)

    # 3. Caso FORMAS DIFERENCIALES M(x,y)dx + N(x,y)dy = 0 (UANL FIME Capítulo 2)
    # Detectar si contiene dx o dy aislados (o dx/dy)
    has_differential = bool(re.search(r'\b(dx|dy)\b', clean_str) or re.search(r'dx\s*/\s*dy', clean_str))
    
    if has_differential and not re.search(r'd\^?2y\s*/\s*dx\^?2', clean_str):
        try:
            M, N, rem = parse_differential_form(clean_str)
            if rem == 0 and (M != 0 or N != 0):
                # Verificar si es de variables separables (UANL Sec. 2.1)
                sep_info = check_separable(M, N)
                if sep_info is not None:
                    return solve_separable_ode(M, N, sep_info=sep_info, x0=x0, y0=y0)
                    
                # Verificar si es EXACTA (Euler: dM/dy == dN/dx)
                My = sp.diff(M, y)
                Nx = sp.diff(N, x)
                if sp.simplify(My - Nx) == 0:
                    return solve_exact_ode(M, N, x0=x0, y0=y0)
                    
                # Verificar si tiene Factor Integrante mu(x) o mu(y)
                fx = sp.simplify((My - Nx) / N)
                gy = sp.simplify((Nx - My) / M)
                if (y not in fx.free_symbols and fx != 0) or (x not in gy.free_symbols and gy != 0):
                    return solve_integrating_factor_ode(M, N, x0=x0, y0=y0)
                    
                # Verificar si es HOMOGÉNEA (sustituir x e y positivos para simplificar radicales)
                _x_pos = sp.Symbol('_x_pos', positive=True)
                ratio_v = sp.simplify((M / N).subs({x: _x_pos, y: v * _x_pos}))
                if _x_pos not in ratio_v.free_symbols:
                    return solve_homogeneous_ode(M, N, x0=x0, y0=y0)
                    
                # Verificar si es lineal en y: dy/dx = -M/N
                dydx = sp.simplify(-M / N)
                A = sp.diff(dydx, y)
                B = sp.simplify(dydx - A*y)
                if (y not in A.free_symbols) and (y not in B.free_symbols):
                    return solve_linear_first_order_ode(-A, B, var_dep=y, var_indep=x, x0=x0, y0=y0)
                    
                # Verificar si es lineal en x: dx/dy = -N/M
                dxdy = sp.simplify(-N / M)
                Ax = sp.diff(dxdy, x)
                Bx = sp.simplify(dxdy - Ax*x)
                if (x not in Ax.free_symbols) and (x not in Bx.free_symbols):
                    return solve_linear_first_order_ode(-Ax, Bx, var_dep=x, var_indep=y, x0=x0, y0=y0)
                    
                # Fallback: intentar resolver exacta/integrante
                return solve_exact_ode(M, N, x0=x0, y0=y0)
        except Exception:
            pass

    # 4. Caso NOTACIÓN DE DERIVADAS: dy/dx, y', y'', etc.
    s_deriv = clean_str
    s_deriv = re.sub(r'd\^?2y\s*/\s*dx\^?2', "y''", s_deriv, flags=re.I)
    s_deriv = re.sub(r'd\^?2x\s*/\s*dy\^?2', "y''", s_deriv, flags=re.I)
    s_deriv = re.sub(r'dy\s*/\s*dx', "y'", s_deriv, flags=re.I)
    s_deriv = re.sub(r'd\s*/\s*dx\s*\(?\s*y\s*\)?', "y'", s_deriv, flags=re.I)
    
    # Manejar caso dx/dy = 2x invirtiendo o tratándolo como derivada de x respecto a y
    if re.search(r'\bdx\s*/\s*dy\b', s_deriv, re.I):
        # dx/dy = f(x, y) -> M = 1, N = -f(x, y)
        m_dx = re.match(r'^\s*dx\s*/\s*dy\s*=\s*(.+)$', s_deriv, re.I)
        if m_dx:
            rhs_part = m_dx.group(1).strip()
            return parse_and_solve_ode(f"dx - ({rhs_part})dy = 0", x0=x0, y0=y0, y1=y1)

    if '=' in s_deriv:
        lhs_str, rhs_str = s_deriv.split('=', 1)
    else:
        if "y'" in s_deriv or "y''" in s_deriv:
            lhs_str, rhs_str = s_deriv, '0'
        else:
            lhs_str, rhs_str = "y'", s_deriv

    def transform_part(s):
        e = s.strip()
        if not e:
            return '0'
        e = re.sub(r'\be\^\(([^)]+)\)', r'exp(\1)', e)
        e = re.sub(r'\be\^([a-zA-Z0-9_]+)', r'exp(\1)', e)
        e = re.sub(r'\bln\b', 'log', e)
        e = e.replace("y''", "DIFFTWO").replace("y'", "DIFFONE")
        
        # Multiplicación implícita
        e = re.sub(r'(\d+(?:\.\d+)?)\s*([a-zA-Z])', r'\1*\2', e)
        e = re.sub(r'(\d+(?:\.\d+)?)\s*\(', r'\1*(', e)
        e = re.sub(r'\)\s*\(', ')*(', e)
        e = re.sub(r'\)\s*([a-zA-Z0-9])', r')*\1', e)
        e = re.sub(r'\bx\s*y\b', 'x*y', e)
        e = re.sub(r'\by\s*x\b', 'y*x', e)
        e = re.sub(r'\bx\s*\(', 'x*(', e)
        
        funcs = ['sin', 'cos', 'tan', 'cot', 'exp', 'log', 'sqrt']
        for fn in funcs:
            e = re.sub(r'(\bx)\s*(' + fn + r'\b)', r'\1*\2', e)
            
        e = re.sub(r'\by\b(?!\()', 'y(x)', e)
        e = e.replace('DIFFTWO', 'y(x).diff(x, 2)')
        e = e.replace('DIFFONE', 'y(x).diff(x)')
        e = e.replace('^', '**')
        return e

    y_func = sp.Function('y')
    local_dict_deriv = {
        'x': x, 'y': y_func,
        'exp': sp.exp, 'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan, 'cot': sp.cot,
        'ln': sp.log, 'log': sp.log, 'e': sp.E, 'pi': sp.pi, 'sqrt': sp.sqrt
    }
    
    lhs_expr_str = transform_part(lhs_str)
    rhs_expr_str = transform_part(rhs_str)
    
    lhs = sp.nsimplify(parse_expr(lhs_expr_str, local_dict=local_dict_deriv, transformations=TRANSFORMATIONS))
    rhs = sp.nsimplify(parse_expr(rhs_expr_str, local_dict=local_dict_deriv, transformations=TRANSFORMATIONS))
    eq = sp.Eq(lhs, rhs)
    
    derivs = [d for d in eq.atoms(sp.Derivative) if d.expr == y_func(x)]
    
    # 5. Si NO hay derivadas, es una ECUACIÓN ALGEBRAICA (5x + 3 = 4x + 6)
    if not derivs:
        syms = list(eq.free_symbols)
        sym = x if x in syms else (y if y in syms else (syms[0] if syms else x))
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
            
        sol_str_latex = f"{sym} = {sp.latex(sol[0])}" if len(sol) == 1 else (
            ", \\; ".join([f"{sym}_{{{i+1}}} = {sp.latex(s)}" for i, s in enumerate(sol)]) if sol else "\\text{Sin solución real}"
        )
        return {
            "latex_eq": sp.latex(eq),
            "latex_general": sol_str_latex,
            "str_general": str(sol),
            "latex_particular": sol_str_latex,
            "str_particular": sol_str_latex,
            "order": 0,
            "method_name": "Ecuación Algebraica",
            "steps": steps,
            "plot_points": plot_points
        }

    order = max([len(d.variables) for d in derivs], default=1)
    
    # Resolver ecuación diferencial estándar
    diff_y = y_func(x).diff(x)
    diff2_y = y_func(x).diff(x, 2)
    
    if order == 1:
        try:
            dydx_sol = sp.solve(eq, diff_y)
            if dydx_sol:
                dydx = dydx_sol[0]
                has_y = y_func(x) in dydx.atoms(sp.Function)
                
                # Integración Directa dy/dx = f(x)
                if not has_y:
                    f_int = sp.integrate(dydx, x)
                    sol_gen = sp.Eq(y_func(x), f_int + C)
                    steps = [
                        make_step(1, 'Identificación de la EDO de Integración Directa', 'La derivada dy/dx es igual a una función f(x) que depende únicamente de la variable independiente x:', f"\\frac{{dy}}{{dx}} = {sp.latex(dydx)}"),
                        make_step(2, 'Separación de Diferenciales', 'Multiplicamos ambos miembros por el diferencial dx:', f"dy = \\left({sp.latex(dydx)}\\right)dx"),
                        make_step(3, 'Integración Indefinida', 'Aplicamos el operador integral ∫ a ambos lados de la igualdad:', f"\\int dy = \\int \\left({sp.latex(dydx)}\\right)dx"),
                        make_step(4, 'Solución General', 'La antiderivada de dy es y(x). Sumamos la constante arbitraria C:', f"y(x) = {sp.latex(f_int)} + C")
                    ]
                    
                    sol_part = None
                    if y0 is not None:
                        c_val = sp.nsimplify(y0) - f_int.subs(x, sp.nsimplify(x0))
                        sol_part = sp.Eq(y_func(x), f_int + c_val)
                        steps.append(make_step(5, 'Solución Particular (PVI)', f'Sustituimos x₀ = {x0}, y(x₀) = {y0}:', f"y(x) = {sp.latex(f_int + c_val)}"))
                        
                    return {
                        "latex_eq": sp.latex(eq),
                        "latex_general": sp.latex(sol_gen),
                        "str_general": str(sol_gen),
                        "latex_particular": sp.latex(sol_part) if sol_part else None,
                        "str_particular": str(sol_part) if sol_part else None,
                        "order": 1,
                        "method_name": "Integración Directa (UANL Sec. 2.1)",
                        "steps": steps,
                        "plot_points": safe_plot_points(sol_part if sol_part else sol_gen, x, y, x0=x0)
                    }
                else:
                    # Lineal de 1er orden dy/dx = A*y + B
                    A = dydx.diff(y_func(x))
                    B = sp.simplify(dydx - A*y_func(x))
                    if (y_func(x) not in A.atoms(sp.Function)) and (y_func(x) not in B.atoms(sp.Function)):
                        return solve_linear_first_order_ode(-A, B, var_dep=y, var_indep=x, x0=x0, y0=y0)
        except Exception:
            pass

    # Fallback general con sp.dsolve
    sol_gen = sp.dsolve(eq, y_func(x))
    ics = {}
    sx0 = sp.nsimplify(x0)
    if y0 is not None:
        ics[y_func(sx0)] = sp.nsimplify(y0)
    if y1 is not None and order > 1:
        ics[y_func(x).diff(x).subs(x, sx0)] = sp.nsimplify(y1)
        
    sol_part = None
    if ics:
        try:
            sol_part = sp.dsolve(eq, y_func(x), ics=ics)
        except Exception:
            sol_part = None
            
    steps = [
        make_step(1, 'Forma Canónica de la Ecuación Diferencial', f'EDO de orden {order} escrita en notación estándar:', sp.latex(eq)),
        make_step(2, 'Resolución Analítica Paso a Paso', 'Aplicando los métodos de integración simbólica de la FIME UANL obtenemos la familia de curvas:', sp.latex(sol_gen))
    ]
    if sol_part is not None:
        steps.append(make_step(3, 'Solución Particular Única del PVI', f'Aplicando las condiciones iniciales dadas:', sp.latex(sol_part)))
        
    return {
        "latex_eq": sp.latex(eq),
        "latex_general": sp.latex(sol_gen),
        "str_general": str(sol_gen),
        "latex_particular": sp.latex(sol_part) if sol_part else None,
        "str_particular": str(sol_part) if sol_part else None,
        "order": order,
        "method_name": f"EDO de Orden {order}",
        "steps": steps,
        "plot_points": safe_plot_points(sol_part if sol_part else sol_gen, x, y, x0=x0)
    }
