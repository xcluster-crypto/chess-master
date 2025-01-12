'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { Button } from '@/components/ui/button'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function ChessGame() {
  const [game, setGame] = useState(new Chess())
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [isComputerOpponent, setIsComputerOpponent] = useState(false)
  const [isComputerTurn, setIsComputerTurn] = useState(false)

  const makeAMove = useCallback((move: any) => {
    try {
      const result = game.move(move)
      setGame(new Chess(game.fen()))
      setMoveHistory(prevHistory => [...prevHistory, game.fen()])
      return result
    } catch (error) {
      return null
    }
  }, [game])

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen for simplicity
    })

    if (move === null) return false

    if (isComputerOpponent) {
      setIsComputerTurn(true)
    }

    return true
  }

  const makeComputerMove = useCallback(() => {
    if (game.isGameOver() || !isComputerTurn) return

    const possibleMoves = game.moves()
    if (possibleMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * possibleMoves.length)
      makeAMove(possibleMoves[randomIndex])
      setIsComputerTurn(false)
    }
  }, [game, isComputerTurn, makeAMove])

  useEffect(() => {
    if (isComputerOpponent && isComputerTurn) {
      const timer = setTimeout(makeComputerMove, 500) // 500ms delay for computer move
      return () => clearTimeout(timer)
    }
  }, [isComputerOpponent, isComputerTurn, makeComputerMove])

  const resetGame = () => {
    setGame(new Chess())
    setMoveHistory([])
    setIsComputerTurn(false)
  }

  const newGame = () => {
    resetGame()
  }

  const repeatMove = () => {
    if (moveHistory.length > 1) {
      const previousState = moveHistory[moveHistory.length - 2]
      setGame(new Chess(previousState))
      setMoveHistory(prevHistory => prevHistory.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Chess Master</h1>
      <div className="w-[400px] h-[400px] mb-4">
        <Chessboard position={game.fen()} onPieceDrop={onDrop} />
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="computer-mode"
          checked={isComputerOpponent}
          onCheckedChange={setIsComputerOpponent}
        />
        <Label htmlFor="computer-mode">
          {isComputerOpponent ? "Player vs Computer" : "Player vs Player"}
        </Label>
      </div>
      <div className="flex space-x-4 mt-4">
        <Button onClick={repeatMove} disabled={moveHistory.length <= 1}>
          Repeat
        </Button>
        <Button onClick={resetGame}>Reset</Button>
        <Button onClick={newGame}>New Game</Button>
      </div>
      <div className="mt-4 text-lg">
        {game.isGameOver() ? (
          <p>
            Game Over! 
            {game.isCheckmate() ? ` ${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!` : 
             game.isDraw() ? ' The game is a draw.' : 
             ' The game is over.'}
          </p>
        ) : (
          <p>{game.turn() === 'w' ? 'White' : 'Black'} to move</p>
        )}
      </div>
    </div>
  )
}

