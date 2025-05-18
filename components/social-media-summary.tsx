"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2
} from "lucide-react"

export function SocialMediaSummary() {
  // Dados simulados para o resumo de redes sociais
  const socialMediaData = {
    instagram: {
      followers: 2845,
      growth: "+12%",
      engagement: "3.2%",
      pendingMessages: 5,
      lastPost: {
        likes: 156,
        comments: 23,
        shares: 18,
        date: "2 dias atrás",
      },
    },
    linkedin: {
      followers: 1250,
      growth: "+8%",
      engagement: "2.5%",
      pendingMessages: 2,
      lastPost: {
        likes: 87,
        comments: 12,
        shares: 9,
        date: "3 dias atrás",
      },
    },
    facebook: {
      followers: 1850,
      growth: "+5%",
      engagement: "1.8%",
      pendingMessages: 3,
      lastPost: {
        likes: 65,
        comments: 8,
        shares: 12,
        date: "1 dia atrás",
      },
    },
    twitter: {
      followers: 950,
      growth: "+3%",
      engagement: "1.2%",
      pendingMessages: 1,
      lastPost: {
        likes: 32,
        comments: 5,
        shares: 7,
        date: "4 dias atrás",
      },
    },
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3 w-3 text-green-500" />
          <span className="text-xxs font-medium">Crescimento médio: +7% no último mês</span>
        </div>
        <Link href="/redes-sociais">
          <Button variant="outline" size="sm" className="h-6 text-xxs">
            Ver Análise Completa
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {/* Instagram */}
        <div className="border rounded-sm p-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Instagram className="h-3 w-3 text-pink-500" />
              <span className="text-xxs font-medium">Instagram</span>
            </div>
            <span className="text-xxs text-green-500">{socialMediaData.instagram.growth}</span>
          </div>
          <div className="flex justify-between text-xxxs text-muted-foreground">
            <span>{socialMediaData.instagram.followers} seguidores</span>
            <span>{socialMediaData.instagram.engagement} engajamento</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-xxxs">
            <div className="flex items-center gap-0.5">
              <Heart className="h-2 w-2 text-red-500" />
              <span>{socialMediaData.instagram.lastPost.likes}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <MessageCircle className="h-2 w-2 text-blue-500" />
              <span>{socialMediaData.instagram.lastPost.comments}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Share2 className="h-2 w-2 text-green-500" />
              <span>{socialMediaData.instagram.lastPost.shares}</span>
            </div>
          </div>
          <div className="text-xxxs text-muted-foreground mt-0.5">
            Última postagem: {socialMediaData.instagram.lastPost.date}
          </div>
          {socialMediaData.instagram.pendingMessages > 0 && (
            <div className="text-xxxs text-orange-500 mt-0.5">
              {socialMediaData.instagram.pendingMessages} mensagens pendentes
            </div>
          )}
        </div>

        {/* LinkedIn */}
        <div className="border rounded-sm p-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Linkedin className="h-3 w-3 text-blue-600" />
              <span className="text-xxs font-medium">LinkedIn</span>
            </div>
            <span className="text-xxs text-green-500">{socialMediaData.linkedin.growth}</span>
          </div>
          <div className="flex justify-between text-xxxs text-muted-foreground">
            <span>{socialMediaData.linkedin.followers} seguidores</span>
            <span>{socialMediaData.linkedin.engagement} engajamento</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-xxxs">
            <div className="flex items-center gap-0.5">
              <Heart className="h-2 w-2 text-red-500" />
              <span>{socialMediaData.linkedin.lastPost.likes}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <MessageCircle className="h-2 w-2 text-blue-500" />
              <span>{socialMediaData.linkedin.lastPost.comments}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Share2 className="h-2 w-2 text-green-500" />
              <span>{socialMediaData.linkedin.lastPost.shares}</span>
            </div>
          </div>
          <div className="text-xxxs text-muted-foreground mt-0.5">
            Última postagem: {socialMediaData.linkedin.lastPost.date}
          </div>
          {socialMediaData.linkedin.pendingMessages > 0 && (
            <div className="text-xxxs text-orange-500 mt-0.5">
              {socialMediaData.linkedin.pendingMessages} mensagens pendentes
            </div>
          )}
        </div>

        {/* Facebook */}
        <div className="border rounded-sm p-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Facebook className="h-3 w-3 text-blue-500" />
              <span className="text-xxs font-medium">Facebook</span>
            </div>
            <span className="text-xxs text-green-500">{socialMediaData.facebook.growth}</span>
          </div>
          <div className="flex justify-between text-xxxs text-muted-foreground">
            <span>{socialMediaData.facebook.followers} seguidores</span>
            <span>{socialMediaData.facebook.engagement} engajamento</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-xxxs">
            <div className="flex items-center gap-0.5">
              <Heart className="h-2 w-2 text-red-500" />
              <span>{socialMediaData.facebook.lastPost.likes}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <MessageCircle className="h-2 w-2 text-blue-500" />
              <span>{socialMediaData.facebook.lastPost.comments}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Share2 className="h-2 w-2 text-green-500" />
              <span>{socialMediaData.facebook.lastPost.shares}</span>
            </div>
          </div>
          <div className="text-xxxs text-muted-foreground mt-0.5">
            Última postagem: {socialMediaData.facebook.lastPost.date}
          </div>
          {socialMediaData.facebook.pendingMessages > 0 && (
            <div className="text-xxxs text-orange-500 mt-0.5">
              {socialMediaData.facebook.pendingMessages} mensagens pendentes
            </div>
          )}
        </div>

        {/* Twitter */}
        <div className="border rounded-sm p-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Twitter className="h-3 w-3 text-blue-400" />
              <span className="text-xxs font-medium">X (Twitter)</span>
            </div>
            <span className="text-xxs text-green-500">{socialMediaData.twitter.growth}</span>
          </div>
          <div className="flex justify-between text-xxxs text-muted-foreground">
            <span>{socialMediaData.twitter.followers} seguidores</span>
            <span>{socialMediaData.twitter.engagement} engajamento</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-xxxs">
            <div className="flex items-center gap-0.5">
              <Heart className="h-2 w-2 text-red-500" />
              <span>{socialMediaData.twitter.lastPost.likes}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <MessageCircle className="h-2 w-2 text-blue-500" />
              <span>{socialMediaData.twitter.lastPost.comments}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Share2 className="h-2 w-2 text-green-500" />
              <span>{socialMediaData.twitter.lastPost.shares}</span>
            </div>
          </div>
          <div className="text-xxxs text-muted-foreground mt-0.5">
            Última postagem: {socialMediaData.twitter.lastPost.date}
          </div>
          {socialMediaData.twitter.pendingMessages > 0 && (
            <div className="text-xxxs text-orange-500 mt-0.5">
              {socialMediaData.twitter.pendingMessages} mensagens pendentes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

