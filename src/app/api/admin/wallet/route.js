import { dbConnect } from "@/lib/db";
import Wallet from "@/models/Wallet";
import { NextResponse } from "next/server";

// 하나의 wallet만 가져오기 (없으면 새로 생성)
export async function GET() {
  try {
    await dbConnect();
    let wallet = await Wallet.findOne().sort({ createdAt: -1 });

    if (!wallet) {
      // 기본 address로 새 wallet 생성
      wallet = await Wallet.create({
        address: "0x0000000000000000000000000000000000000000",
        label: "Default Wallet",
      });
      console.log("✅ New wallet created automatically:", wallet.address);
    }

    return NextResponse.json(wallet);
  } catch (err) {
    console.error("❌ Wallet fetch error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// 주소 수정 (없으면 새로 생성)
export async function PUT(req) {
  try {
    await dbConnect();
    const { newAddress } = await req.json();

    if (!newAddress)
      return NextResponse.json({ message: "Missing new address" }, { status: 400 });

    let wallet = await Wallet.findOne().sort({ createdAt: -1 });

    if (!wallet) {
      // 없으면 새로 만듦
      wallet = await Wallet.create({
        address: newAddress,
        label: "Admin-set Wallet",
      });
      return NextResponse.json({
        message: "New wallet created",
        wallet,
      });
    }

    // 기존 wallet 업데이트
    wallet.address = newAddress;
    await wallet.save();

    return NextResponse.json({
      message: "Wallet address updated",
      wallet,
    });
  } catch (err) {
    console.error("❌ Wallet update error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
