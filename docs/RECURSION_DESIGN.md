/**
 * Recursive AST Optimizer - Constant Folding
 * 
 * Demonstrates recursive problem solving:
 * Problem: Optimize a tree T
 * Decomposition:
 * 1. Optimize sub-children (left, right) -> T_left', T_right'
 * 2. If T_left' and T_right' are constants, combine them -> T'
 * 3. Else return node with optimized children
 * 
 * Base Case: Leaf nodes (Literals, Variables) are already optimized.
 */

import { ASTNode, ASTVisitor, BinaryOpNode, LiteralNode, ... } from './ast';

export class ConstantFoldingOptimizer implements ASTVisitor<ASTNode> {
    
    optimize(node: ASTNode): ASTNode {
        return node.accept(this);
    }

    // Base Case: Literals cannot be optimized further
    visitLiteral(node: LiteralNode): ASTNode {
        return node;
    }

    // Base Case: Variables cannot be known at compile time
    visitVariable(node: VariableNode): ASTNode {
        return node;
    }

    // Recursive Step: Optimize children, then try to fold
    visitBinaryOp(node: BinaryOpNode): ASTNode {
        const left = node.left.accept(this);  // Recursive call
        const right = node.right.accept(this); // Recursive call

        if (left instanceof LiteralNode && right instanceof LiteralNode) {
            // Fold constants
            return this.foldBinary(node.operator, left, right);
        }

        // Return new node with optimized children (immutability)
        return new BinaryOpNode(node.operator, left, right);
    }
    
    // ... other visit methods with similar recursive logic
}
